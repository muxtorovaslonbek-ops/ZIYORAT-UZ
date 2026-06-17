// approve-payment — admin tasdiqlaydi yoki rad etadi.
// Faqat admin roli bo'lgan foydalanuvchi chaqira oladi.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLAN_DAYS: Record<string, number> = { "1m": 30, "3m": 90, "12m": 365 };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const auth = req.headers.get("Authorization") || "";
    const jwt = auth.replace("Bearer ", "");
    if (!jwt) return json({ error: "Unauthorized" }, 401);

    // Verify caller via anon client + JWT
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    // Check admin via service role
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: roleRow } = await admin.from("user_roles")
      .select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) return json({ error: "Forbidden — admin only" }, 403);

    const body = await req.json();
    const { request_id, action, admin_note } = body;
    if (!request_id || !["approve", "reject"].includes(action)) return json({ error: "Bad input" }, 400);

    const { data: pr, error: prErr } = await admin.from("payment_requests")
      .select("*").eq("id", request_id).maybeSingle();
    if (prErr || !pr) return json({ error: "Request not found" }, 404);
    if (pr.status !== "pending") return json({ error: "Already processed" }, 400);

    if (action === "reject") {
      await admin.from("payment_requests").update({
        status: "rejected", admin_note: admin_note || null,
        reviewed_by: user.id, reviewed_at: new Date().toISOString(),
      }).eq("id", request_id);
      return json({ ok: true, action: "rejected" });
    }

    // approve → create subscription
    const days = PLAN_DAYS[pr.plan] || 30;
    const now = new Date();
    const expires = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const { error: subErr } = await admin.from("subscriptions").insert({
      user_id: pr.user_id, plan: pr.plan, source: "manual", status: "active",
      started_at: now.toISOString(), expires_at: expires.toISOString(),
      payment_request_id: pr.id,
    });
    if (subErr) return json({ error: "Failed to create subscription: " + subErr.message }, 500);

    await admin.from("payment_requests").update({
      status: "approved", admin_note: admin_note || null,
      reviewed_by: user.id, reviewed_at: now.toISOString(),
    }).eq("id", request_id);

    return json({ ok: true, action: "approved", expires_at: expires.toISOString() });
  } catch (e) {
    console.error("approve-payment error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
