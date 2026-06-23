import { Router } from 'express';
import { pool } from '@workspace/db';
import jwt from 'jsonwebtoken';

const router = Router();

const SUPABASE_URL = 'https://hoofyqhayogecrmemtss.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvb2Z5cWhheW9nZWNybWVtdHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MzkyMDUsImV4cCI6MjA5MjQxNTIwNX0.NPbXubQcVKsZcBfi02DMvHJM8Ssk6yyUuDA-KsHpSEQ';
const JWT_SECRET = process.env.SESSION_SECRET || 'ziyorat_fallback_secret_2026';

// Resolve user ID from either Supabase or Telegram JWT
const resolveUserId = async (authHeader: string | undefined): Promise<{ userId: string | null; email?: string; meta?: any }> => {
  if (!authHeader) return { userId: null };
  const token = authHeader.replace('Bearer ', '');

  // Try our custom Telegram JWT first
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (payload.type === 'telegram' && payload.user_id) {
      return { userId: payload.user_id, email: payload.email, meta: payload };
    }
  } catch {
    // not our JWT, try Supabase
  }

  // Try Supabase JWT
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY },
    });
    if (res.ok) {
      const user = await res.json();
      if (user?.id) return { userId: user.id, email: user.email, meta: user };
    }
  } catch {
    // ignore
  }

  return { userId: null };
};

// GET /api/premium/status
router.get('/premium/status', async (req: any, res: any) => {
  const { userId } = await resolveUserId(req.headers.authorization);
  if (!userId) return res.json({ ok: true, premium: false, requestStatus: null });

  const { rows: grants } = await pool.query('SELECT user_id FROM premium_grants WHERE user_id=$1', [userId]);
  const { rows: reqs } = await pool.query('SELECT status FROM premium_requests WHERE user_id=$1', [userId]);

  res.json({
    ok: true,
    premium: grants.length > 0,
    userId,
    requestStatus: reqs[0]?.status || null,
  });
});

// POST /api/premium/request
router.post('/premium/request', async (req: any, res: any) => {
  const { userId, email, meta } = await resolveUserId(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: 'Token kerak' });

  const userName = req.body.user_name || meta?.full_name || meta?.user_metadata?.full_name || '';
  const tgUsername = req.body.telegram_username || meta?.telegram_username || meta?.user_metadata?.telegram_username || '';

  await pool.query(
    `INSERT INTO premium_requests (user_id, user_email, user_name, telegram_username)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id) DO UPDATE SET
       user_email = EXCLUDED.user_email,
       user_name = EXCLUDED.user_name,
       requested_at = now(),
       status = CASE WHEN premium_requests.status = 'rejected' THEN 'pending' ELSE premium_requests.status END`,
    [userId, email || '', userName, tgUsername]
  );
  res.json({ ok: true });
});

// POST /api/profile/sync
router.post('/profile/sync', async (req: any, res: any) => {
  const { userId, email, meta } = await resolveUserId(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: 'Token kerak' });

  const { full_name, telegram_id, telegram_username } = req.body;

  await pool.query(
    `INSERT INTO user_registry (user_id, email, full_name, telegram_id, telegram_username, last_seen)
     VALUES ($1, $2, $3, $4, $5, now())
     ON CONFLICT (user_id) DO UPDATE SET
       email = COALESCE(EXCLUDED.email, user_registry.email),
       full_name = COALESCE(EXCLUDED.full_name, user_registry.full_name),
       telegram_id = COALESCE(EXCLUDED.telegram_id, user_registry.telegram_id),
       telegram_username = COALESCE(EXCLUDED.telegram_username, user_registry.telegram_username),
       last_seen = now()`,
    [
      userId,
      email || '',
      full_name || meta?.full_name || meta?.user_metadata?.full_name || '',
      telegram_id || meta?.telegram_id || meta?.user_metadata?.telegram_id || null,
      telegram_username || meta?.telegram_username || meta?.user_metadata?.telegram_username || null,
    ]
  );
  res.json({ ok: true });
});

export default router;
