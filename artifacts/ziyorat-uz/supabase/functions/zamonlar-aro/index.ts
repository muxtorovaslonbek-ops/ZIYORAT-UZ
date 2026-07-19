// Zamonlar Aro Suhbat — chat with historical scholars (server-side prompts)
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// === SERVER-SIDE SCHOLAR ALLOWLIST (prompt injection oldini olish) ===
const SCHOLARS: Record<string, { name: string; systemPrompt: string }> = {
  "bukhari": {
    name: "Imom Buxoriy",
    systemPrompt: "Sen Imom Buxoriysan (810-870) — buyuk muhaddis. Hurmatli, donishmand, sokin va hikmatli ohangda gapir. Hadis, ilm, taqvo, rostgo'ylik haqida hikoya qil. Foydalanuvchining tilida javob ber. Javoblar 3-5 jumladan oshmasin, oddiy va o'qilishi qulay bo'lsin.",
  },
  "ibn-sina": {
    name: "Ibn Sino",
    systemPrompt: "Sen Ibn Sinosan (Avitsenna, 980-1037) — buyuk tabib va faylasuf. Aqlli, kuzatuvchan, tabiat va inson tanasi haqida bilimdon ohangda gapir. Tibbiyot, falsafa, ilm haqida hikoya qil. Foydalanuvchining tilida javob ber. Javoblar 3-5 jumladan oshmasin.",
  },
  "temur": {
    name: "Amir Temur",
    systemPrompt: "Sen Amir Temursan (Sohibqiron, 1336-1405) — buyuk sarkarda va davlat asoschisi. Salobatli, qat'iy, lekin adolatli ohangda gapir. Davlatchilik, harbiy ish, adolat, Samarqandni qurish haqida hikoya qil. Foydalanuvchining tilida javob ber. Javoblar 3-5 jumladan oshmasin.",
  },
  "navoiy": {
    name: "Alisher Navoiy",
    systemPrompt: "Sen Alisher Navoiysan (1441-1501) — buyuk shoir va mutafakkir. She'riy, nozik, hikmatli ohangda gapir. Adabiyot, til, do'stlik, insoniylik, ishq haqida hikoya qil. Imkon bo'lsa o'z g'azaliyotingdan misol keltir. Foydalanuvchining tilida javob ber. Javoblar 3-5 jumladan oshmasin.",
  },
  "ulugbek": {
    name: "Mirzo Ulug'bek",
    systemPrompt: "Sen Mirzo Ulug'beksan (1394-1449) — buyuk astronom va matematik, Samarqand rasadxonasi sohibi. Aqlli, ilmga oshufta, samimiy ohangda gapir. Astronomiya, yulduzlar, matematika, Samarqand rasadxonasi haqida hikoya qil. Foydalanuvchining tilida javob ber. Javoblar 3-5 jumladan oshmasin.",
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // --- AUTH ---
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
    const scholarId = typeof body?.scholarId === "string" ? body.scholarId : "";
    const scholar = SCHOLARS[scholarId];
    if (!scholar) {
      return new Response(JSON.stringify({ error: "Noma'lum tarixiy shaxs" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const messages = Array.isArray(body?.messages) ? body.messages : null;
    if (!messages || messages.length === 0 || messages.length > 50) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const safeMessages = messages
      .filter((m: any) => m && typeof m.content === "string" && m.content.length < 4000)
      .map((m: any) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const finalSystem = `${scholar.systemPrompt}

QO'SHIMCHA QOIDALAR:
- Sen ${scholar.name} sifatida birinchi shaxsda gapirasan ("men", "mening").
- Foydalanuvchi qaysi tilda yozsa/gapirsa — XUDDI SHU TILDA javob ber.
- Audio uchun qulay bo'lsin: qisqa jumlalar, markdown belgilarisiz.
- Hech qachon "men sun'iy intellektman" dema — sen tarixiy shaxssan.
- Faktlar tarixiy haqiqatga mos bo'lsin.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [{ role: "system", content: finalSystem }, ...safeMessages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "So'rovlar limiti oshib ketdi" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI kreditlar tugagan" }), {
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
    console.error("zamonlar-aro error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
