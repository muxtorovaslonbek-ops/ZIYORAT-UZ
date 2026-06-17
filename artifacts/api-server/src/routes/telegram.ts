import { Router } from "express";

const router = Router();

// ── In-memory pending codes ────────────────────────────────────────────────
interface PendingEntry {
  telegram_id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  expires: number;
}
const pendingCodes = new Map<string, PendingEntry>();

// Clean up expired codes every 5 min
setInterval(() => {
  const now = Date.now();
  for (const [code, entry] of pendingCodes) {
    if (entry.expires < now) pendingCodes.delete(code);
  }
}, 5 * 60 * 1000);

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

// ── Set webhook (called on server start) ──────────────────────────────────
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
    if (data.ok) {
      console.log(`[telegram] Webhook set: ${webhookUrl}`);
    } else {
      console.error("[telegram] Webhook error:", data.description);
    }
  } catch (err) {
    console.error("[telegram] Failed to set webhook:", err);
  }
}

// ── Webhook handler ────────────────────────────────────────────────────────
router.post("/telegram/webhook", async (req, res) => {
  res.sendStatus(200); // Always respond 200 immediately

  const update = req.body;
  const message = update?.message;
  if (!message) return;

  const chatId: number = message.chat?.id;
  const text: string = message.text || "";
  const from = message.from || {};

  const domains = process.env.REPLIT_DOMAINS || "";
  const domain = domains.split(",")[0].trim();
  const siteUrl = domain ? `https://${domain}/auth` : "https://ziyorat.uz/auth";

  if (text.startsWith("/start")) {
    const code = generateCode();
    pendingCodes.set(code, {
      telegram_id: from.id,
      username: from.username,
      first_name: from.first_name || "Foydalanuvchi",
      last_name: from.last_name,
      expires: Date.now() + 10 * 60 * 1000, // 10 min
    });

    const name = from.first_name ? `*${from.first_name}*` : "Siz";
    await sendMessage(
      chatId,
      `👋 Assalomu alaykum, ${name}! *ZIYORAT UZ* botiga xush kelibsiz!\n\n` +
      `🕌 O'zbekistonning ziyorat joylari, tarixiy obidalari va premium xizmatlari bir joyda.\n\n` +
      `🔐 *Saytda ro'yxatdan o'tish uchun sizning kodingiz:*\n\n` +
      `\`${code}\`\n\n` +
      `📱 Quyidagi saytga kiring, *"Telegram orqali"* bo'limini tanlang va kodni kiriting:\n` +
      `👉 ${siteUrl}\n\n` +
      `⏱ Kod *10 daqiqa* amal qiladi.\n\n` +
      `Savollar bo'lsa /help yuboring.`
    );
    return;
  }

  if (text === "/help") {
    await sendMessage(
      chatId,
      `ℹ️ *ZIYORAT UZ — Yordam*\n\n` +
      `▪️ /start — Ro'yxatdan o'tish kodi olish\n` +
      `▪️ /newcode — Yangi kod yaratish\n\n` +
      `🌐 Sayt: ${siteUrl}`
    );
    return;
  }

  if (text === "/newcode") {
    const code = generateCode();
    pendingCodes.set(code, {
      telegram_id: from.id,
      username: from.username,
      first_name: from.first_name || "Foydalanuvchi",
      last_name: from.last_name,
      expires: Date.now() + 10 * 60 * 1000,
    });
    await sendMessage(
      chatId,
      `🔄 Yangi kod yaratildi:\n\n\`${code}\`\n\n⏱ Kod 10 daqiqa amal qiladi.\n👉 ${siteUrl}`
    );
    return;
  }

  // Unknown message
  await sendMessage(
    chatId,
    `🤔 Tushunmadim. /start yoki /help yuboring.`
  );
});

// ── Verify code endpoint (called from frontend) ────────────────────────────
router.get("/telegram/verify-code/:code", (req, res) => {
  const { code } = req.params;
  const entry = pendingCodes.get(code);

  if (!entry) {
    res.status(404).json({ ok: false, error: "Kod topilmadi yoki muddati o'tgan" });
    return;
  }
  if (entry.expires < Date.now()) {
    pendingCodes.delete(code);
    res.status(410).json({ ok: false, error: "Kod muddati o'tgan. Bot orqali yangi kod oling." });
    return;
  }

  // Don't delete yet — let frontend complete signup first
  res.json({
    ok: true,
    data: {
      telegram_id: entry.telegram_id,
      username: entry.username || null,
      first_name: entry.first_name,
      last_name: entry.last_name || null,
    },
  });
});

// ── Consume code after successful signup ───────────────────────────────────
router.delete("/telegram/verify-code/:code", (req, res) => {
  pendingCodes.delete(req.params.code);
  res.json({ ok: true });
});

export default router;
