import { Router } from 'express';
import { pool } from '@workspace/db';

const router = Router();

const SUPABASE_URL = 'https://hoofyqhayogecrmemtss.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvb2Z5cWhheW9nZWNybWVtdHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MzkyMDUsImV4cCI6MjA5MjQxNTIwNX0.NPbXubQcVKsZcBfi02DMvHJM8Ssk6yyUuDA-KsHpSEQ';

const getSupabaseUser = async (token: string) => {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
};

// GET /api/premium/status
router.get('/premium/status', async (req: any, res: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.json({ ok: true, premium: false });
  const user = await getSupabaseUser(token);
  if (!user?.id) return res.json({ ok: true, premium: false });
  const { rows } = await pool.query(
    'SELECT user_id FROM premium_grants WHERE user_id=$1',
    [user.id]
  );
  // Also check request status
  const { rows: reqs } = await pool.query(
    'SELECT status FROM premium_requests WHERE user_id=$1',
    [user.id]
  );
  res.json({
    ok: true,
    premium: rows.length > 0,
    userId: user.id,
    requestStatus: reqs[0]?.status || null,
  });
});

// POST /api/premium/request
router.post('/premium/request', async (req: any, res: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token kerak' });
  const user = await getSupabaseUser(token);
  if (!user?.id) return res.status(401).json({ error: "Noto'g'ri token" });
  const { user_name, telegram_username } = req.body;
  await pool.query(
    `INSERT INTO premium_requests (user_id, user_email, user_name, telegram_username)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id) DO UPDATE SET
       user_email = EXCLUDED.user_email,
       user_name = EXCLUDED.user_name,
       requested_at = now(),
       status = CASE WHEN premium_requests.status = 'rejected' THEN 'pending' ELSE premium_requests.status END`,
    [user.id, user.email || '', user_name || '', telegram_username || '']
  );
  res.json({ ok: true });
});

// POST /api/profile/sync
router.post('/profile/sync', async (req: any, res: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token kerak' });
  const user = await getSupabaseUser(token);
  if (!user?.id) return res.status(401).json({ error: "Noto'g'ri token" });
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
      user.id,
      user.email || '',
      full_name || user.user_metadata?.full_name || '',
      telegram_id || user.user_metadata?.telegram_id || null,
      telegram_username || user.user_metadata?.telegram_username || null,
    ]
  );
  res.json({ ok: true });
});

export default router;
