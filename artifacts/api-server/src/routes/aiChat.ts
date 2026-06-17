import { Router } from "express";

const router = Router();

const SYSTEM_PROMPT = `Siz "AI Ziyorat Yo'lboshchi" — O'zbekiston ziyoratgohlari, tarixiy obidalari, masjid va madrasalari bo'yicha bilimdon virtual hamrohsiz.

QOIDALAR:
- Foydalanuvchi qaysi tilda yozsa/gapirsa — XUDDI SHU TILDA javob bering (uzbek, rus, ingliz, arab, turk, fors, va boshqalar). Tilni avtomatik aniqlang.
- Javoblar iliq, hurmatli, hikoya uslubida — go'yo siz haqiqiy ziyorat hamrohi.
- Tarixiy faktlar (qachon qurilgan, kim tomonidan, me'mor, ahamiyat) aniq bo'lsin.
- Agar foydalanuvchi joy nomini aytsa (masalan "Registon", "Bibi-Xonim", "Shohi Zinda", "Imom Buxoriy") — qisqa, jonli hikoya qiling: tarixi, me'mori, qiziqarli faktlar.
- Savollarga ("kim qurgan?", "qachon?", "qancha turadi?") — to'g'ridan-to'g'ri va lo'nda javob bering.
- Audio uchun o'qilishi qulay bo'lsin: qisqa jumlalar, ortiqcha belgilar yo'q, markdown minimal.
- Javob 4-8 jumladan oshmasin, agar foydalanuvchi "batafsil" so'ramasa.`;

router.post("/ai-chat", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "AI xizmati sozlanmagan. GEMINI_API_KEY yo'q." });
    return;
  }

  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages massivi kerak" });
    return;
  }

  const history = messages.slice(0, -1).map((m: any) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const lastMessage = messages[messages.length - 1];

  const body = JSON.stringify({
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [
      ...history,
      { role: "user", parts: [{ text: lastMessage.content }] },
    ],
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.8,
    },
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  let geminiRes: Response;
  try {
    geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  } catch (err) {
    req.log.error({ err }, "Gemini fetch error");
    res.write(`data: ${JSON.stringify({ error: "AI xizmatiga ulanib bo'lmadi" })}\n\n`);
    res.end();
    return;
  }

  if (!geminiRes.ok) {
    const errText = await geminiRes.text().catch(() => "");
    req.log.error({ status: geminiRes.status, errText }, "Gemini API error");
    let userErr = "AI xizmat xatosi";
    if (geminiRes.status === 400) userErr = "So'rov noto'g'ri";
    if (geminiRes.status === 401 || geminiRes.status === 403) userErr = "API kalit noto'g'ri";
    if (geminiRes.status === 429) userErr = "So'rovlar ko'p, biroz kuting";
    res.write(`data: ${JSON.stringify({ error: userErr })}\n\n`);
    res.end();
    return;
  }

  if (!geminiRes.body) {
    res.write(`data: ${JSON.stringify({ error: "Bo'sh javob" })}\n\n`);
    res.end();
    return;
  }

  const reader = geminiRes.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buf += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buf.indexOf("\n")) !== -1) {
        const line = buf.slice(0, nl).trimEnd();
        buf = buf.slice(nl + 1);
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (!jsonStr || jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
          }
        } catch {
          // skip malformed chunks
        }
      }
    }
  } catch (err) {
    req.log.error({ err }, "Gemini stream read error");
    res.write(`data: ${JSON.stringify({ error: "Stream uzildi" })}\n\n`);
  }

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

export default router;
