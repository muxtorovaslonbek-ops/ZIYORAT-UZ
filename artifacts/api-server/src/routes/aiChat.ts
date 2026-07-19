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

const FREE_MODELS = [
  "google/gemma-4-26b-a4b-it:free",
  "openai/gpt-oss-120b:free",
  "liquid/lfm-2.5-1.2b-instruct:free",
  "meta-llama/llama-3.3-70b-instruct:free",
];

router.post("/ai-chat", async (req, res) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "AI xizmati sozlanmagan." });
    return;
  }

  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages massivi kerak" });
    return;
  }

  const orMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.map((m: any) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  let lastError = "";
  for (const model of FREE_MODELS) {
    const body = JSON.stringify({
      model,
      messages: orMessages,
      stream: true,
      max_tokens: 1024,
      temperature: 0.8,
    });

    let orRes: Response;
    try {
      orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://ziyorat.uz",
          "X-Title": "Ziyorat UZ AI Guide",
        },
        body,
      });
    } catch (err) {
      req.log.error({ err, model }, "OpenRouter fetch error");
      lastError = "Ulanish xatosi";
      continue;
    }

    if (orRes.status === 429) {
      lastError = "So'rovlar ko'p, biroz kuting";
      continue;
    }
    if (orRes.status === 402) {
      lastError = "Kredit yetarli emas";
      continue;
    }
    if (!orRes.ok) {
      const t = await orRes.text().catch(() => "");
      req.log.error({ status: orRes.status, body: t, model }, "OpenRouter error");
      lastError = `Xato (${orRes.status})`;
      continue;
    }

    if (!orRes.body) {
      lastError = "Bo'sh javob";
      continue;
    }

    const reader = orRes.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let gotContent = false;

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
            const delta = parsed?.choices?.[0]?.delta?.content;
            if (delta) {
              gotContent = true;
              res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
            }
          } catch {
            // skip malformed
          }
        }
      }
    } catch (err) {
      req.log.error({ err, model }, "OpenRouter stream error");
      if (!gotContent) {
        lastError = "Stream uzildi";
        continue;
      }
    }

    if (gotContent) {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
      return;
    }
    lastError = "Bo'sh javob";
  }

  // all models failed
  res.write(`data: ${JSON.stringify({ error: lastError || "AI xizmat ishlamadi" })}\n\n`);
  res.end();
});

export default router;
