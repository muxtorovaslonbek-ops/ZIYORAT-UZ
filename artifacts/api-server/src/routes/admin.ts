import { Router } from 'express';
import { pool } from '@workspace/db';
import { randomBytes } from 'crypto';

const router = Router();

const ADMIN_USERNAME = 'aslonbek0722';
const ADMIN_PASSWORD = 'aziza0722';

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
      last_seen TIMESTAMPTZ DEFAULT now()
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
  `);
};
initDb().catch(console.error);

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

// POST /api/admin/login
router.post('/admin/login', async (req: any, res: any) => {
  const { username, password } = req.body;
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, error: "Login yoki parol noto'g'ri" });
  }
  const token = randomBytes(32).toString('hex');
  await pool.query('INSERT INTO admin_tokens (token) VALUES ($1)', [token]);
  res.json({ ok: true, token });
});

// GET /api/admin/verify
router.get('/admin/verify', requireAdmin, (_req: any, res: any) => {
  res.json({ ok: true });
});

// POST /api/admin/logout
router.post('/admin/logout', async (req: any, res: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) await pool.query('DELETE FROM admin_tokens WHERE token=$1', [token]);
  res.json({ ok: true });
});

// GET /api/admin/users — all registered users with premium status
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

// GET /api/admin/requests
router.get('/admin/requests', requireAdmin, async (_req: any, res: any) => {
  const { rows } = await pool.query(
    `SELECT pr.*, CASE WHEN pg.user_id IS NOT NULL THEN true ELSE false END as is_premium
     FROM premium_requests pr
     LEFT JOIN premium_grants pg ON pr.user_id = pg.user_id
     ORDER BY pr.requested_at DESC`
  );
  res.json({ ok: true, requests: rows });
});

// POST /api/admin/grant/:userId
router.post('/admin/grant/:userId', requireAdmin, async (req: any, res: any) => {
  const { userId } = req.params;
  await pool.query(
    'INSERT INTO premium_grants (user_id) VALUES ($1) ON CONFLICT DO NOTHING',
    [userId]
  );
  await pool.query(
    `UPDATE premium_requests SET status='approved', reviewed_at=now() WHERE user_id=$1`,
    [userId]
  );
  res.json({ ok: true });
});

// DELETE /api/admin/grant/:userId
router.delete('/admin/grant/:userId', requireAdmin, async (req: any, res: any) => {
  const { userId } = req.params;
  await pool.query('DELETE FROM premium_grants WHERE user_id=$1', [userId]);
  res.json({ ok: true });
});

// POST /api/admin/approve/:userId
router.post('/admin/approve/:userId', requireAdmin, async (req: any, res: any) => {
  const { userId } = req.params;
  await pool.query(
    'INSERT INTO premium_grants (user_id) VALUES ($1) ON CONFLICT DO NOTHING',
    [userId]
  );
  await pool.query(
    `UPDATE premium_requests SET status='approved', reviewed_at=now() WHERE user_id=$1`,
    [userId]
  );
  res.json({ ok: true });
});

// POST /api/admin/reject/:userId
router.post('/admin/reject/:userId', requireAdmin, async (req: any, res: any) => {
  const { userId } = req.params;
  await pool.query(
    `UPDATE premium_requests SET status='rejected', reviewed_at=now() WHERE user_id=$1`,
    [userId]
  );
  res.json({ ok: true });
});

export default router;
