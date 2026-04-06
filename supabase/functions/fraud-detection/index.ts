import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { introduction_id, actor_id } = await req.json();

    const { data: intro } = await supabase
      .from("introductions")
      .select("*, besoins!inner(entreprise_id)")
      .eq("id", introduction_id)
      .single();

    if (!intro) throw new Error("Introduction not found");

    const flags: Array<{ flag_type: string; severity: string; evidence: any }> = [];

    // Rule 1: Self-attribution (facilitateur == entreprise)
    if (intro.facilitateur_id === (intro as any).besoins?.entreprise_id) {
      flags.push({
        flag_type: "self_attribution",
        severity: "high",
        evidence: { reason: "Facilitateur is the same as entreprise owner" },
      });
    }

    // Rule 2: Low activation rate (< 5% on 10+ intros)
    const { data: facilIntros } = await supabase
      .from("introductions")
      .select("status")
      .eq("facilitateur_id", intro.facilitateur_id);

    if (facilIntros && facilIntros.length >= 10) {
      const accepted = facilIntros.filter(i => ["accepted", "meeting_scheduled", "won"].includes(i.status || "")).length;
      const rate = accepted / facilIntros.length;
      if (rate < 0.05) {
        flags.push({
          flag_type: "fake_lead",
          severity: "medium",
          evidence: { activation_rate: rate, total_intros: facilIntros.length },
        });
      }
    }

    // Rule 3: Off-platform (accepted > 60 days silence)
    if (intro.status === "accepted") {
      const acceptedDate = new Date(intro.updated_at);
      const daysSince = (Date.now() - acceptedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince > 60) {
        flags.push({
          flag_type: "off_platform",
          severity: "medium",
          evidence: { days_since_accepted: Math.floor(daysSince) },
        });
      }
    }

    // Rule 4: Amount reduction (deal_amount << sector median)
    if (intro.deal_amount && intro.status === "won") {
      const { data: sectorDeals } = await supabase
        .from("introductions")
        .select("deal_amount")
        .eq("status", "won")
        .not("deal_amount", "is", null);

      if (sectorDeals && sectorDeals.length >= 5) {
        const amounts = sectorDeals.map(d => d.deal_amount!).sort((a, b) => a - b);
        const median = amounts[Math.floor(amounts.length / 2)];
        const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const stdDev = Math.sqrt(amounts.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / amounts.length);
        if (intro.deal_amount < median - 3 * stdDev) {
          flags.push({
            flag_type: "amount_reduction",
            severity: "low",
            evidence: { deal_amount: intro.deal_amount, median, std_dev: stdDev },
          });
        }
      }
    }

    // Insert flags and degrade reputation
    for (const flag of flags) {
      await supabase.from("fraud_flags").insert({
        flagged_user_id: intro.facilitateur_id,
        ...flag,
      });

      // Degrade reputation
      const penalty = flag.severity === "high" ? -30 : flag.severity === "medium" ? -10 : -5;
      const { data: profile } = await supabase
        .from("profiles")
        .select("reputation_score")
        .eq("id", intro.facilitateur_id)
        .single();

      if (profile) {
        const newScore = Math.max(0, (profile.reputation_score || 100) + penalty);
        await supabase.from("profiles").update({ reputation_score: newScore }).eq("id", intro.facilitateur_id);
      }
    }

    return new Response(JSON.stringify({ flags_created: flags.length, flags }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
