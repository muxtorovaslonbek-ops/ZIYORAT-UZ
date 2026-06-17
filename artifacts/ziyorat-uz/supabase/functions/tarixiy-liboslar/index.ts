// Tarixiy Liboslar — AI photo montage of historical Uzbek attire
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// === SERVER-SIDE ATTIRE ALLOWLIST ===
const ATTIRES: Record<string, { name: string; description: string; background: string }> = {
  "amir-temur": {
    name: "Amir Temur",
    description: "Oltin zarbof choponi, qimmatbaho toshlar bilan bezatilgan toj-salla, yashil-qizil ipak ichki kiyim, kamarda jangchi qilichi, qo'lda hokimiyat tayog'i",
    background: "Samarqanddagi Bibi-Xonim masjidi yaqinida, oltin tong nuri, hashamatli saroy hovlisi",
  },
  "alisher-navoiy": {
    name: "Alisher Navoiy",
    description: "Yashil ipak choponi, oq nafis salla, kashta tikilgan kamar, qo'lda qalam va kitob, donishmand ulamo qiyofasi",
    background: "Hirot kutubxonasi, qadimiy qo'lyozmalar va xattotlik asboblari, derazadan tushgan yumshoq nur",
  },
  "imom-buxoriy": {
    name: "Imom Buxoriy",
    description: "Oq va och yashil rangli uzun jubba, oq salla, tasbeh qo'lda, ulamo libosi, sodda va vazmin uslub",
    background: "Buxorodagi qadimiy madrasa hovlisi, ganch o'ymakorligi, ilm muhiti",
  },
  "ulugbek": {
    name: "Mirzo Ulug'bek",
    description: "Ko'k va kumush rangli zarbof choponi, yulduzli naqshlar, astronomik asboblar (asturlab) qo'lda, shoh-olim qiyofasi",
    background: "Samarqand rasadxonasi, kechqurun yulduzli osmon, mis astronomik asboblar",
  },
  "ibn-sino": {
    name: "Ibn Sino",
    description: "Qo'ng'ir va oltin rangli olim choponi, oq salla, qo'lda tabobat kitobi va shisha qadahda dorivor o'simlik",
    background: "Qadimiy tabobat xonasi, javon to'la qo'lyozmalar va dori shishalar, sham yorug'i",
  },
  "erkak-toy": {
    name: "Erkak — Milliy to'y",
    description: "Yorqin atlas zarbof chopon, do'ppi (zarbof), ipak kamar, oq ko'ylak, an'anaviy to'y libosi",
    background: "An'anaviy o'zbek hovlisi, gullagan o'rik daraxti, supa va ko'rpachalar",
  },
  "erkak-jangchi": {
    name: "Sohibqiron jangchisi",
    description: "Po'lat zirhli ko'ylak, dubulg'a, charm etiklar, qilich va qalqon, jangchi qiyofasi",
    background: "Tarixiy jang maydoni cheti, bayroqlar va otlar, tongotar nuri",
  },
  "bibi-xonim": {
    name: "Bibi Xonim",
    description: "Oltin va qizil zarbof uzun ko'ylak, qimmatbaho marvarid taqinchoqlar, baland zar bezakli bosh kiyim (kulta), nafis ipak ro'mol, malika qiyofasi",
    background: "Bibi-Xonim masjidi old hovlisi, oltin quyosh nuri, marmar ustunlar",
  },
  "ayol-toy": {
    name: "Ayol — Milliy to'y",
    description: "Yorqin xon-atlas (xonatlas) ko'ylak, kashta tikilgan nimcha, marvarid va kumush taqinchoqlar, baxmal do'ppi yoki ro'mol, kelinchak libosi",
    background: "An'anaviy o'zbek hovlisi, gullagan bog', qizil so'zana fonida",
  },
  "ayol-shoira": {
    name: "Saroy shoirasi",
    description: "Ko'k va kumush ipak ko'ylak, nafis kashta, oq tor ro'mol, qo'lda qalam va g'azal kitob, ma'rifatli ayol qiyofasi",
    background: "Hirot kutubxonasi, qo'lyozmalar va anor shabchiroqlar, yumshoq sham yorug'i",
  },
  "ayol-malika": {
    name: "Saroy malikasi",
    description: "To'q qizil baxmal va oltin tikuvli uzun libos, marvarid taqinchoqlar, baland kulta bosh kiyim ustida nafis duvozda, qirol ayol qiyofasi",
    background: "Samarqand saroyi marmar zalida, gilam va shamdonlar, hashamatli muhit",
  },
  "ayol-bukhori": {
    name: "Buxorolik xonim",
    description: "Yashil va oltin zarbof ko'ylak, paranji o'rniga nafis ipak ro'mol, kumush bilakuzuk va sirg'a, klassik buxorolik xonim qiyofasi",
    background: "Buxorodagi Lyabi-Hovuz, qadimiy g'isht devorlar, kechki oltin nur",
  },
};

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

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
    const attireId = typeof body?.attireId === "string" ? body.attireId : "";
    const attire = ATTIRES[attireId];
    if (!attire) {
      return new Response(JSON.stringify({ error: "Noma'lum libos turi" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageBase64 = typeof body?.imageBase64 === "string" ? body.imageBase64 : "";
    const mimeType = typeof body?.mimeType === "string" ? body.mimeType : "image/jpeg";
    if (!imageBase64 || imageBase64.length > 10_000_000) {
      return new Response(JSON.stringify({ error: "Noto'g'ri rasm" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!ALLOWED_MIME.has(mimeType)) {
      return new Response(JSON.stringify({ error: "Faqat JPEG/PNG/WEBP" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `Bu shaxsning yuzini saqlab qolib (yuz xususiyatlari, teri rangi, soch turi o'zgarmasin), uni ${attire.name} liboslarida tasvirla. Kiyim: ${attire.description}. Fon: ${attire.background}. Uslub: kino sifatidagi realistik portret, premium fotografiya, yumshoq kun yorug'ligi, tarixiy va hashamatli muhit. Yuqori detallashtirilgan mato to'qimasi va naqshlar. Faqat bitta tasvir qaytar.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${imageBase64}` },
              },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI image edit error:", resp.status, t);
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "So'rovlar limiti oshib ketdi" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "AI kreditlar tugagan" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI xizmatida xatolik" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(data).slice(0, 500));
      return new Response(JSON.stringify({ error: "Tasvir yaratilmadi" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("tarixiy-liboslar error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
