import { Router } from 'express';
import { pool } from '@workspace/db';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';

const router = Router();

const ADMIN_USERNAME = 'aslonbek0722';
const ADMIN_PASSWORD = 'aziza0722';
const SESSION_SECRET = process.env.SESSION_SECRET || 'ziyorat_secret_2024';

// ── DB setup ──────────────────────────────────────────────────────────────
const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_tokens (
      token TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT now(),
      expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '30 days'
    );
    CREATE TABLE IF NOT EXISTS user_registry (
      user_id TEXT PRIMARY KEY,
      email TEXT,
      full_name TEXT,
      telegram_id TEXT,
      telegram_username TEXT,
      registered_at TIMESTAMPTZ DEFAULT now(),
      last_seen TIMESTAMPTZ DEFAULT now(),
      is_blocked BOOLEAN DEFAULT false
    );
    CREATE TABLE IF NOT EXISTS premium_grants (
      user_id TEXT PRIMARY KEY,
      granted_at TIMESTAMPTZ DEFAULT now(),
      granted_by TEXT DEFAULT 'admin'
    );
    CREATE TABLE IF NOT EXISTS premium_requests (
      user_id TEXT PRIMARY KEY,
      user_email TEXT,
      user_name TEXT,
      telegram_username TEXT,
      status TEXT DEFAULT 'pending',
      requested_at TIMESTAMPTZ DEFAULT now(),
      reviewed_at TIMESTAMPTZ
    );
    CREATE TABLE IF NOT EXISTS market_products (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      category TEXT NOT NULL DEFAULT 'boshqa',
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL DEFAULT 0,
      region TEXT,
      material TEXT,
      rating NUMERIC(2,1) DEFAULT 4.5,
      badge TEXT,
      img_url TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      target TEXT DEFAULT 'all',
      icon TEXT DEFAULT 'bell',
      sent_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS admin_messages (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      to_user_id TEXT,
      to_user_name TEXT,
      to_user_email TEXT,
      subject TEXT,
      message TEXT NOT NULL,
      admin_reply TEXT,
      sent_at TIMESTAMPTZ DEFAULT now(),
      replied_at TIMESTAMPTZ
    );
    CREATE TABLE IF NOT EXISTS contract_applications (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      applicant_type TEXT DEFAULT 'guide',
      full_name TEXT NOT NULL,
      organization_name TEXT,
      phone TEXT NOT NULL,
      email TEXT,
      region TEXT,
      address TEXT,
      certificate_number TEXT,
      message TEXT,
      status TEXT DEFAULT 'new',
      admin_reply TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      reviewed_at TIMESTAMPTZ
    );
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS user_activity (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT,
      user_name TEXT,
      action TEXT NOT NULL,
      meta TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
  await pool.query(`
    ALTER TABLE user_registry ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;
    ALTER TABLE notifications ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'bell';
  `).catch(() => {});
};
initDb().catch(console.error);

// ── Helper: get current user from Authorization header (Supabase or TG JWT) ─
const getUserFromToken = (authHeader: string | undefined): { userId: string; isPremium?: boolean; isTelegram?: boolean } | null => {
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  // Try TG JWT first
  try {
    const payload = jwt.verify(token, SESSION_SECRET) as any;
    if (payload.telegram_id) return { userId: String(payload.telegram_id), isTelegram: true };
  } catch {}
  // Try Supabase JWT (just decode, don't verify — we trust the client)
  try {
    const payload = jwt.decode(token) as any;
    if (payload?.sub) return { userId: payload.sub, isTelegram: false };
  } catch {}
  return null;
};

// ── Admin token middleware ─────────────────────────────────────────────────
export const requireAdmin = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token kerak' });
  const { rows } = await pool.query(
    `SELECT token FROM admin_tokens WHERE token=$1 AND expires_at>now()`,
    [token]
  );
  if (!rows.length) return res.status(401).json({ error: "Token noto'g'ri" });
  next();
};

// ── Auth ───────────────────────────────────────────────────────────────────
router.post('/admin/login', async (req: any, res: any) => {
  const { username, password } = req.body;
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, error: "Login yoki parol noto'g'ri" });
  }
  const token = randomBytes(32).toString('hex');
  await pool.query('INSERT INTO admin_tokens (token) VALUES ($1)', [token]);
  res.json({ ok: true, token });
});

router.get('/admin/verify', requireAdmin, (_req: any, res: any) => {
  res.json({ ok: true });
});

router.post('/admin/logout', async (req: any, res: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) await pool.query('DELETE FROM admin_tokens WHERE token=$1', [token]);
  res.json({ ok: true });
});

// ── Users ──────────────────────────────────────────────────────────────────
router.get('/admin/users', requireAdmin, async (_req: any, res: any) => {
  const { rows: users } = await pool.query(
    'SELECT * FROM user_registry ORDER BY last_seen DESC LIMIT 1000'
  );
  const { rows: premiums } = await pool.query('SELECT user_id FROM premium_grants');
  const { rows: requests } = await pool.query('SELECT user_id, status FROM premium_requests');
  const premiumSet = new Set(premiums.map((p: any) => p.user_id));
  const requestMap = new Map(requests.map((r: any) => [r.user_id, r.status]));
  const enriched = users.map((u: any) => ({
    ...u,
    is_premium: premiumSet.has(u.user_id),
    request_status: requestMap.get(u.user_id) || null,
  }));
  res.json({ ok: true, users: enriched });
});

router.patch('/admin/users/:userId/block', requireAdmin, async (req: any, res: any) => {
  const { userId } = req.params;
  const { blocked } = req.body;
  await pool.query('UPDATE user_registry SET is_blocked=$1 WHERE user_id=$2', [!!blocked, userId]);
  res.json({ ok: true });
});

router.delete('/admin/users/:userId', requireAdmin, async (req: any, res: any) => {
  const { userId } = req.params;
  await pool.query('DELETE FROM user_registry WHERE user_id=$1', [userId]);
  await pool.query('DELETE FROM premium_grants WHERE user_id=$1', [userId]);
  await pool.query('DELETE FROM premium_requests WHERE user_id=$1', [userId]);
  res.json({ ok: true });
});

// ── Premium ────────────────────────────────────────────────────────────────
router.post('/admin/grant/:userId', requireAdmin, async (req: any, res: any) => {
  const { userId } = req.params;
  await pool.query('INSERT INTO premium_grants (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [userId]);
  await pool.query(`UPDATE premium_requests SET status='approved', reviewed_at=now() WHERE user_id=$1`, [userId]);
  res.json({ ok: true });
});

router.delete('/admin/grant/:userId', requireAdmin, async (req: any, res: any) => {
  await pool.query('DELETE FROM premium_grants WHERE user_id=$1', [req.params.userId]);
  res.json({ ok: true });
});

router.get('/admin/requests', requireAdmin, async (_req: any, res: any) => {
  const { rows } = await pool.query(
    `SELECT pr.*, CASE WHEN pg.user_id IS NOT NULL THEN true ELSE false END as is_premium
     FROM premium_requests pr
     LEFT JOIN premium_grants pg ON pr.user_id = pg.user_id
     ORDER BY pr.requested_at DESC`
  );
  res.json({ ok: true, requests: rows });
});

router.post('/admin/approve/:userId', requireAdmin, async (req: any, res: any) => {
  const { userId } = req.params;
  await pool.query('INSERT INTO premium_grants (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [userId]);
  await pool.query(`UPDATE premium_requests SET status='approved', reviewed_at=now() WHERE user_id=$1`, [userId]);
  res.json({ ok: true });
});

router.post('/admin/reject/:userId', requireAdmin, async (req: any, res: any) => {
  await pool.query(
    `UPDATE premium_requests SET status='rejected', reviewed_at=now() WHERE user_id=$1`,
    [req.params.userId]
  );
  res.json({ ok: true });
});

// ── Market Products ────────────────────────────────────────────────────────
router.get('/admin/products', requireAdmin, async (_req: any, res: any) => {
  const { rows } = await pool.query('SELECT * FROM market_products ORDER BY created_at DESC');
  res.json({ ok: true, products: rows });
});

router.post('/admin/products', requireAdmin, async (req: any, res: any) => {
  const { category, name, description, price, region, material, rating, badge, img_url } = req.body;
  if (!name) return res.status(400).json({ ok: false, error: 'Nomi kerak' });
  const { rows } = await pool.query(
    `INSERT INTO market_products (category, name, description, price, region, material, rating, badge, img_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [category || 'boshqa', name, description || null, price || 0, region || null,
     material || null, rating || 4.5, badge || null, img_url || null]
  );
  res.json({ ok: true, product: rows[0] });
});

router.patch('/admin/products/:id', requireAdmin, async (req: any, res: any) => {
  const { id } = req.params;
  const { name, description, price, region, material, rating, badge, img_url, category, is_active } = req.body;
  await pool.query(
    `UPDATE market_products SET name=$1, description=$2, price=$3, region=$4, material=$5,
     rating=$6, badge=$7, img_url=$8, category=$9, is_active=$10 WHERE id=$11`,
    [name, description, price, region, material, rating, badge, img_url, category, is_active, id]
  );
  res.json({ ok: true });
});

router.delete('/admin/products/:id', requireAdmin, async (req: any, res: any) => {
  await pool.query('DELETE FROM market_products WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

// Public: get active products for Milliy Market
router.get('/products', async (_req: any, res: any) => {
  const { rows } = await pool.query('SELECT * FROM market_products WHERE is_active=true ORDER BY created_at DESC');
  res.json({ ok: true, products: rows });
});

// ── Notifications ──────────────────────────────────────────────────────────
router.get('/admin/notifications', requireAdmin, async (_req: any, res: any) => {
  const { rows } = await pool.query('SELECT * FROM notifications ORDER BY sent_at DESC LIMIT 100');
  res.json({ ok: true, notifications: rows });
});

router.post('/admin/notifications/send', requireAdmin, async (req: any, res: any) => {
  const { title, message, target, icon } = req.body;
  if (!title || !message) return res.status(400).json({ ok: false, error: 'Sarlavha va xabar kerak' });
  const { rows } = await pool.query(
    'INSERT INTO notifications (title, message, target, icon) VALUES ($1,$2,$3,$4) RETURNING *',
    [title, message, target || 'all', icon || 'bell']
  );
  res.json({ ok: true, notification: rows[0] });
});

router.delete('/admin/notifications/:id', requireAdmin, async (req: any, res: any) => {
  await pool.query('DELETE FROM notifications WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

// ── Public: user inbox (notifications + personal messages) ─────────────────
// Returns notifications relevant to this user and personal admin messages
router.get('/user/inbox', async (req: any, res: any) => {
  const authHeader = req.headers.authorization;
  const userInfo = getUserFromToken(authHeader);

  // Build notification targets
  const targets = ['all'];
  let isPremium = false;
  if (userInfo) {
    if (userInfo.isTelegram) targets.push('telegram');
    // Check premium
    const { rows: pg } = await pool.query(
      'SELECT user_id FROM premium_grants WHERE user_id=$1', [userInfo.userId]
    );
    if (pg.length) { isPremium = true; targets.push('premium'); }
  }

  const placeholders = targets.map((_, i) => `$${i + 1}`).join(',');
  const { rows: notifs } = await pool.query(
    `SELECT * FROM notifications WHERE target IN (${placeholders}) ORDER BY sent_at DESC LIMIT 30`,
    targets
  );

  // Personal messages
  let messages: any[] = [];
  if (userInfo) {
    const { rows: msgs } = await pool.query(
      `SELECT id, subject, message, admin_reply, sent_at, replied_at FROM admin_messages
       WHERE to_user_id=$1 ORDER BY sent_at DESC LIMIT 20`,
      [userInfo.userId]
    );
    messages = msgs;
  }

  res.json({ ok: true, notifications: notifs, messages, isPremium });
});

// ── Admin Messages ─────────────────────────────────────────────────────────
router.get('/admin/messages', requireAdmin, async (_req: any, res: any) => {
  const { rows } = await pool.query('SELECT * FROM admin_messages ORDER BY sent_at DESC LIMIT 200');
  res.json({ ok: true, messages: rows });
});

router.post('/admin/messages/send', requireAdmin, async (req: any, res: any) => {
  const { to_user_id, to_user_name, to_user_email, subject, message } = req.body;
  if (!message) return res.status(400).json({ ok: false, error: 'Xabar matni kerak' });
  const { rows } = await pool.query(
    `INSERT INTO admin_messages (to_user_id, to_user_name, to_user_email, subject, message)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [to_user_id || null, to_user_name || null, to_user_email || null, subject || null, message]
  );
  res.json({ ok: true, msg: rows[0] });
});

router.post('/admin/messages/:id/reply', requireAdmin, async (req: any, res: any) => {
  const { reply } = req.body;
  await pool.query(
    'UPDATE admin_messages SET admin_reply=$1, replied_at=now() WHERE id=$2',
    [reply, req.params.id]
  );
  res.json({ ok: true });
});

router.delete('/admin/messages/:id', requireAdmin, async (req: any, res: any) => {
  await pool.query('DELETE FROM admin_messages WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

// ── Contracts ──────────────────────────────────────────────────────────────
router.get('/admin/contracts', requireAdmin, async (_req: any, res: any) => {
  const { rows } = await pool.query('SELECT * FROM contract_applications ORDER BY created_at DESC LIMIT 200');
  res.json({ ok: true, contracts: rows });
});

router.patch('/admin/contracts/:id/status', requireAdmin, async (req: any, res: any) => {
  const { status } = req.body;
  await pool.query(
    'UPDATE contract_applications SET status=$1, reviewed_at=now() WHERE id=$2',
    [status, req.params.id]
  );
  res.json({ ok: true });
});

router.post('/admin/contracts/:id/reply', requireAdmin, async (req: any, res: any) => {
  const { reply, status } = req.body;
  await pool.query(
    'UPDATE contract_applications SET admin_reply=$1, status=COALESCE($2, status), reviewed_at=now() WHERE id=$3',
    [reply, status || null, req.params.id]
  );
  res.json({ ok: true });
});

// ── Activity Log ───────────────────────────────────────────────────────────
router.get('/admin/activity', requireAdmin, async (_req: any, res: any) => {
  // Aggregate recent activity from multiple tables
  const { rows: registrations } = await pool.query(
    `SELECT user_id, full_name as user_name, 'register' as action,
     registered_at as created_at, email as meta
     FROM user_registry ORDER BY registered_at DESC LIMIT 10`
  );
  const { rows: premiums } = await pool.query(
    `SELECT pg.user_id, ur.full_name as user_name, 'premium_grant' as action,
     pg.granted_at as created_at, pg.granted_by as meta
     FROM premium_grants pg
     LEFT JOIN user_registry ur ON pg.user_id = ur.user_id
     ORDER BY pg.granted_at DESC LIMIT 10`
  );
  const { rows: contracts } = await pool.query(
    `SELECT id as user_id, full_name as user_name, 'contract' as action,
     created_at, applicant_type as meta
     FROM contract_applications ORDER BY created_at DESC LIMIT 10`
  );
  const { rows: premReqs } = await pool.query(
    `SELECT user_id, user_name, 'premium_request' as action,
     requested_at as created_at, status as meta
     FROM premium_requests ORDER BY requested_at DESC LIMIT 10`
  );

  // Merge and sort
  const all = [...registrations, ...premiums, ...contracts, ...premReqs]
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 40);

  res.json({ ok: true, activity: all });
});

// ── Site Settings ──────────────────────────────────────────────────────────
router.get('/admin/settings', requireAdmin, async (_req: any, res: any) => {
  const { rows } = await pool.query('SELECT key, value FROM site_settings');
  const settings: Record<string, string> = {};
  rows.forEach((r: any) => { settings[r.key] = r.value; });
  res.json({ ok: true, settings });
});

router.post('/admin/settings', requireAdmin, async (req: any, res: any) => {
  const { key, value } = req.body;
  if (!key) return res.status(400).json({ ok: false, error: 'Key kerak' });
  await pool.query(
    `INSERT INTO site_settings (key, value) VALUES ($1,$2)
     ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=now()`,
    [key, value ?? '']
  );
  res.json({ ok: true });
});

// Public: get site settings (announcement, maintenance)
router.get('/settings/public', async (_req: any, res: any) => {
  const { rows } = await pool.query(
    `SELECT key, value FROM site_settings WHERE key IN ('announcement','maintenance_mode','announcement_type')`
  );
  const settings: Record<string, string> = {};
  rows.forEach((r: any) => { settings[r.key] = r.value; });
  res.json({ ok: true, settings });
});

// Public: submit contract (for Partnership page)
router.post('/contracts/submit', async (req: any, res: any) => {
  const { applicant_type, full_name, organization_name, phone, email, region, address, certificate_number, message } = req.body;
  if (!full_name || !phone) return res.status(400).json({ ok: false, error: 'Ism va telefon kerak' });
  const { rows } = await pool.query(
    `INSERT INTO contract_applications
       (applicant_type, full_name, organization_name, phone, email, region, address, certificate_number, message)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
    [applicant_type || 'guide', full_name, organization_name || null, phone, email || null,
     region || null, address || null, certificate_number || null, message || null]
  );
  res.json({ ok: true, id: rows[0].id });
});

// Public: get contract status
router.get('/contracts/:id/status', async (req: any, res: any) => {
  const { rows } = await pool.query(
    'SELECT id, status, admin_reply, created_at, reviewed_at FROM contract_applications WHERE id=$1',
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ ok: false, error: "Topilmadi" });
  res.json({ ok: true, contract: rows[0] });
});

// Public: log user activity
router.post('/user/activity', async (req: any, res: any) => {
  const { user_id, user_name, action, meta } = req.body;
  if (!action) return res.status(400).json({ ok: false });
  await pool.query(
    'INSERT INTO user_activity (user_id, user_name, action, meta) VALUES ($1,$2,$3,$4)',
    [user_id || null, user_name || null, action, meta || null]
  ).catch(() => {});
  res.json({ ok: true });
});

export default router;
