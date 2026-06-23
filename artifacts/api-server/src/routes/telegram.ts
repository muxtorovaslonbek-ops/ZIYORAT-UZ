import { Router } from "express";
import { pool } from "@workspace/db";
import jwt from "jsonwebtoken";

const router = Router();

const JWT_SECRET = process.env.SESSION_SECRET || "ziyorat_fallback_secret_2026";

// ── DB setup ───────────────────────────────────────────────────────────────
const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS telegram_codes (
      code TEXT PRIMARY KEY,
      telegram_id BIGINT NOT NULL,
      username TEXT,
      first_name TEXT NOT NULL,
      last_name TEXT,
      expires_at TIMESTAMPTZ NOT NULL
    );
  `);
  // Clean expired codes every 5 min
  setInterval(async () => {
    await pool.query("DELETE FROM telegram_codes WHERE expires_at < now()").catch(() => {});
  }, 5 * 60 * 1000);
};
initDb().catch(console.error);

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendMessage(chatId: number, text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  }).catch(() => {});
}

// ── Set webhook ────────────────────────────────────────────────────────────
export async function setupTelegramWebhook(): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const domains = process.env.REPLIT_DOMAINS;
  if (!token || !domains) return;
  const domain = domains.split(",")[0].trim();
  const webhookUrl = `https://${domain}/api/telegram/webhook`;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webhookUrl, drop_pending_updates: true }),
    });
    const data = (await res.json()) as any;
    if (data.ok) console.log(`[telegram] Webhook set: ${webhookUrl}`);
    else console.error("[telegram] Webhook error:", data.description);
  } catch (err) {
    console.error("[telegram] Failed to set webhook:", err);
  }
}

// ── Webhook handler ────────────────────────────────────────────────────────
router.post("/telegram/webhook", async (req, res) => {
  res.sendStatus(200);
  const update = req.body;
  const message = update?.message;
  if (!message) return;

  const chatId: number = message.chat?.id;
  const text: string = message.text || "";
  const from = message.from || {};

  const domains = process.env.REPLIT_DOMAINS || "";
  const domain = domains.split(",")[0].trim();
  const siteUrl = domain ? `https://${domain}/auth` : "https://ziyorat.uz/auth";

  if (text.startsWith("/start") || text === "/newcode") {
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await pool
      .query(
        `INSERT INTO telegram_codes (code, telegram_id, username, first_name, last_name, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (code) DO UPDATE SET
           telegram_id = EXCLUDED.telegram_id,
           username = EXCLUDED.username,
           first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name,
           expires_at = EXCLUDED.expires_at`,
        [code, from.id, from.username || null, from.first_name || "Foydalanuvchi", from.last_name || null, expiresAt]
      )
      .catch(console.error);

    const name = from.first_name ? `*${from.first_name}*` : "Siz";
    const greeting = text.startsWith("/start") ? `👋 Assalomu alaykum, ${name}! *ZIYORAT UZ* botiga xush kelibsiz!\n\n🕌 O'zbekistonning ziyorat joylari, tarixiy obidalari va premium xizmatlari bir joyda.\n\n` : "";

    await sendMessage(
      chatId,
      `${greeting}🔐 *Saytga kirish uchun sizning kodingiz:*\n\n` +
      `\`${code}\`\n\n` +
      `📱 Saytga kiring, *"Telegram orqali"* tabini tanlang va kodni kiriting:\n` +
      `👉 ${siteUrl}\n\n` +
      `⏱ Kod *10 daqiqa* amal qiladi.`
    );
    return;
  }

  if (text === "/help") {
    await sendMessage(chatId,
      `ℹ️ *ZIYORAT UZ — Yordam*\n\n▪️ /start — Kirish kodi olish\n▪️ /newcode — Yangi kod yaratish\n\n🌐 ${siteUrl}`
    );
    return;
  }

  await sendMessage(chatId, `🤔 Tushunmadim. /start yuboring va kod oling.\n👉 ${siteUrl}`);
});

// ── POST /api/telegram/auth ─────────────────────────────────────────────────
// Frontend calls this with { code } → returns a signed JWT for the user
router.post("/telegram/auth", async (req: any, res: any) => {
  const { code } = req.body;
  if (!code || String(code).length !== 6) {
    return res.status(400).json({ ok: false, error: "Kod noto'g'ri" });
  }

  const { rows } = await pool.query(
    "SELECT * FROM telegram_codes WHERE code=$1 AND expires_at > now()",
    [String(code)]
  );

  if (!rows.length) {
    return res.status(404).json({ ok: false, error: "Kod topilmadi yoki muddati o'tgan. Botdan yangi kod oling." });
  }

  const entry = rows[0];
  const userId = `tg_${entry.telegram_id}`;
  const fullName = [entry.first_name, entry.last_name].filter(Boolean).join(" ");

  // Delete the code (one-time use)
  await pool.query("DELETE FROM telegram_codes WHERE code=$1", [String(code)]);

  // Register in user_registry
  await pool.query(
    `INSERT INTO user_registry (user_id, email, full_name, telegram_id, telegram_username, last_seen)
     VALUES ($1, $2, $3, $4, $5, now())
     ON CONFLICT (user_id) DO UPDATE SET
       full_name = COALESCE(EXCLUDED.full_name, user_registry.full_name),
       telegram_username = COALESCE(EXCLUDED.telegram_username, user_registry.telegram_username),
       last_seen = now()`,
    [userId, `tg_${entry.telegram_id}@ziyorat.app`, fullName, String(entry.telegram_id), entry.username || null]
  ).catch(console.error);

  // Sign a custom JWT (30 days)
  const token = jwt.sign(
    {
      user_id: userId,
      telegram_id: String(entry.telegram_id),
      telegram_username: entry.username || null,
      full_name: fullName,
      email: `tg_${entry.telegram_id}@ziyorat.app`,
      type: "telegram",
    },
    JWT_SECRET,
    { expiresIn: "30d" }
  );

  res.json({ ok: true, token, user: { user_id: userId, full_name: fullName, telegram_id: String(entry.telegram_id), username: entry.username || null } });
});

// ── GET /api/telegram/verify-code/:code (legacy — kept for compatibility) ──
router.get("/telegram/verify-code/:code", async (req: any, res: any) => {
  const { code } = req.params;
  const { rows } = await pool.query(
    "SELECT * FROM telegram_codes WHERE code=$1 AND expires_at > now()",
    [code]
  );
  if (!rows.length) {
    return res.status(404).json({ ok: false, error: "Kod topilmadi yoki muddati o'tgan" });
  }
  const e = rows[0];
  res.json({ ok: true, data: { telegram_id: e.telegram_id, username: e.username || null, first_name: e.first_name, last_name: e.last_name || null } });
});

router.delete("/telegram/verify-code/:code", async (req: any, res: any) => {
  await pool.query("DELETE FROM telegram_codes WHERE code=$1", [req.params.code]);
  res.json({ ok: true });
});

export default router;
