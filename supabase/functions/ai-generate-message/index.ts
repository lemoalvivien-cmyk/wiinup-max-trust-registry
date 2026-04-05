import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SIGNALS: Record<string, string> = {
  capital_increase: "votre récente augmentation de capital",
  hiring: "votre campagne de recrutement",
  creation: "la création de votre entreprise",
  expansion: "votre expansion géographique",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "",
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) throw new Error("Not authenticated");

    const { prospect_id } = await req.json();
    if (!prospect_id) throw new Error("prospect_id required");

    const { data: prospect } = await supabase
      .from("ai_prospects")
      .select("*")
      .eq("id", prospect_id)
      .single();

    if (!prospect) throw new Error("Prospect not found");

    const signalText = SIGNALS[prospect.signal_type || ""] || "votre activité récente";

    // V1: template-based message
    const message = `Bonjour ${prospect.contact_name || ""},

Suite à ${signalText} chez ${prospect.company_name}, je me permets de vous contacter car nos services pourraient accompagner votre développement.

Notre plateforme WIINUP MAX connecte les entreprises avec des facilitateurs qualifiés dans votre secteur, garantissant des introductions traçables et des deals prouvés.

Seriez-vous disponible pour un échange de 15 minutes cette semaine ?

Cordialement`;

    // Update prospect status
    await supabase
      .from("ai_prospects")
      .update({ suggested_message: message, status: "validated" })
      .eq("id", prospect_id);

    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
