// AI Ziyorat Yo'lboshchi — streaming chat via Lovable AI Gateway
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Siz "AI Ziyorat Yo'lboshchi" — O'zbekiston ziyoratgohlari, tarixiy obidalari, masjid va madrasalari bo'yicha bilimdon virtual hamrohsiz.

QOIDALAR:
- Foydalanuvchi qaysi tilda yozsa/gapirsa — XUDDI SHU TILDA javob bering (uzbek, rus, ingliz, arab, turk, fors, va boshqalar). Tilni avtomatik aniqlang.
- Javoblar iliq, hurmatli, hikoya uslubida — go'yo siz haqiqiy ziyorat hamrohi.
- Tarixiy faktlar (qachon qurilgan, kim tomonidan, me'mor, ahamiyat) aniq bo'lsin.
- Agar foydalanuvchi joy nomini aytsa (masalan "Registon", "Bibi-Xonim", "Shohi Zinda", "Imom Buxoriy") — qisqa, jonli hikoya qiling: tarixi, me'mori, qiziqarli faktlar.
- Savollarga ("kim qurgan?", "qachon?", "qancha turadi?") — to'g'ridan-to'g'ri va lo'nda javob bering.
- Audio uchun o'qilishi qulay bo'lsin: qisqa jumlalar, ortiqcha belgilar yo'q, markdown minimal.
- Javob 4-8 jumladan oshmasin, agar foydalanuvchi "batafsil" so'ramasa.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // --- AUTH: faqat tizimga kirgan foydalanuvchilar ---
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const token = authHeader.replace("Bearer ", "");
  const { data: claims, error: authErr } = await supabase.auth.getClaims(token);
  if (authErr || !claims?.claims?.sub) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : null;
    if (!messages || messages.length === 0 || messages.length > 50) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Faqat kerakli maydonlarni qoldiramiz, role'ni cheklaymiz
    const safeMessages = messages
      .filter((m: any) => m && typeof m.content === "string" && m.content.length < 4000)
      .map((m: any) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...safeMessages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "So'rovlar limiti oshib ketdi, biroz kuting." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI kreditlar tugagan." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI xizmatida xatolik" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-yolboshchi error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
