import { Router } from "express";
import https from "https";

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

  // Build Gemini-compatible history
  const history = messages.slice(0, -1).map((m: any) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const lastMessage = messages[messages.length - 1];

  const requestBody = JSON.stringify({
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

  const options = {
    hostname: "generativelanguage.googleapis.com",
    path: `/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
    },
  };

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const geminiReq = https.request(options, (geminiRes) => {
    let buf = "";

    geminiRes.on("data", (chunk: Buffer) => {
      buf += chunk.toString();
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
        } catch {}
      }
    });

    geminiRes.on("end", () => {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    });

    geminiRes.on("error", (err: Error) => {
      req.log.error({ err }, "Gemini stream error");
      res.write(`data: ${JSON.stringify({ error: "Stream xatosi" })}\n\n`);
      res.end();
    });
  });

  geminiReq.on("error", (err: Error) => {
    req.log.error({ err }, "Gemini request error");
    if (!res.headersSent) {
      res.status(500).json({ error: "AI so'rovi amalga oshmadi" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Ulanish xatosi" })}\n\n`);
      res.end();
    }
  });

  req.on("close", () => geminiReq.destroy());

  geminiReq.write(requestBody);
  geminiReq.end();
});

export default router;
