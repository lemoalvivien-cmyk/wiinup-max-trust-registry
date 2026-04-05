import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MOCK_COMPANIES = [
  { name: "NovaTech Solutions SAS", siren: "912345678", signal: "capital_increase", source: "bodacc" as const },
  { name: "GreenBuild SARL", siren: "823456789", signal: "hiring", source: "job_boards" as const },
  { name: "DigiConsult France", siren: "734567890", signal: "creation", source: "insee" as const },
  { name: "MediaGroup SA", siren: "645678901", signal: "expansion", source: "press" as const },
  { name: "LogiTrans Express", siren: "556789012", signal: "capital_increase", source: "bodacc" as const },
  { name: "CloudFirst SAS", siren: "467890123", signal: "hiring", source: "job_boards" as const },
  { name: "BioPharm Conseil", siren: "378901234", signal: "creation", source: "insee" as const },
  { name: "UrbanDev Group", siren: "289012345", signal: "expansion", source: "press" as const },
  { name: "DataWave Analytics", siren: "190123456", signal: "hiring", source: "job_boards" as const },
  { name: "EcoFinance Partners", siren: "901234567", signal: "capital_increase", source: "bodacc" as const },
];

const SIGNALS: Record<string, string> = {
  capital_increase: "Augmentation de capital détectée",
  hiring: "Recrutement massif en cours",
  creation: "Création d'entreprise récente",
  expansion: "Expansion géographique",
};

const CONTACTS = [
  { name: "Jean-Pierre Martin", email: "jp.martin@example.com" },
  { name: "Sophie Leblanc", email: "s.leblanc@example.com" },
  { name: "Marc Dupuis", email: "m.dupuis@example.com" },
  { name: "Claire Fontaine", email: "c.fontaine@example.com" },
  { name: "Thomas Renard", email: "t.renard@example.com" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get all active entreprises
    const { data: entreprises } = await supabase
      .from("profiles")
      .select("id, sector")
      .eq("role", "entreprise")
      .eq("subscription_status", "active");

    if (!entreprises || entreprises.length === 0) {
      return new Response(JSON.stringify({ message: "No active entreprises" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let totalInserted = 0;

    for (const entreprise of entreprises) {
      const count = Math.floor(Math.random() * 6) + 5; // 5-10 prospects
      const prospects = [];

      for (let i = 0; i < count; i++) {
        const company = MOCK_COMPANIES[Math.floor(Math.random() * MOCK_COMPANIES.length)];
        const contact = CONTACTS[Math.floor(Math.random() * CONTACTS.length)];
        const score = Math.floor(Math.random() * 40) + 60; // 60-100

        prospects.push({
          entreprise_id: entreprise.id,
          company_name: company.name,
          siren: company.siren,
          contact_name: contact.name,
          contact_email: contact.email,
          source: company.source,
          signal_type: company.signal,
          ai_score: score,
          ai_justification: `Signal "${SIGNALS[company.signal]}" détecté pour ${company.name}. Score de pertinence élevé basé sur le secteur ${entreprise.sector || "général"}.`,
          suggested_message: `Bonjour ${contact.name},\n\nSuite à ${SIGNALS[company.signal].toLowerCase()} chez ${company.name}, nous pensons que nos solutions pourraient vous intéresser.\n\nCordialement`,
          status: "new",
        });
      }

      const { error } = await supabase.from("ai_prospects").insert(prospects);
      if (!error) totalInserted += prospects.length;
    }

    // Also create phantom besoins for strong signals
    const strongSignals = MOCK_COMPANIES.filter(() => Math.random() > 0.7);
    for (const company of strongSignals) {
      const randomEntreprise = entreprises[Math.floor(Math.random() * entreprises.length)];
      await supabase.from("besoins").insert({
        entreprise_id: randomEntreprise.id,
        title: `Opportunité détectée : ${company.name}`,
        description: `Signal fort détecté (${SIGNALS[company.signal]}). Besoin auto-généré par l'IA.`,
        sector_target: "tech",
        is_phantom: true,
        ai_source: company.source,
        ai_confidence_score: Math.floor(Math.random() * 20) + 80,
      });
    }

    return new Response(JSON.stringify({ success: true, inserted: totalInserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
