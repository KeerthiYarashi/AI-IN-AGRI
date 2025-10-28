import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const image: string | undefined = body.image;
    const modifiers: string[] = body.modifiers ?? ["crops_fast", "similar_images"];
    const disease_details: string[] = body.disease_details ?? ["cause", "common_names", "treatment"];

    if (!image) {
      return new Response(JSON.stringify({ error: "Missing 'image' (base64) in request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("PLANT_ID_API_KEY");
    if (!apiKey) {
      console.error("PLANT_ID_API_KEY not configured");
      return new Response(JSON.stringify({ error: "API key not configured. Please contact support." }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resp = await fetch("https://api.plant.id/v3/health_assessment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": apiKey,
      },
      body: JSON.stringify({
        images: [image],
        modifiers,
        disease_details,
      }),
    });

    // Forward rate limit / credit errors with friendly messages
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      if (resp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit or credits exceeded. Please wait or top up your API credits.", details: text }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (resp.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Add funds or credits to continue.", details: text }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: `Plant.id error (${resp.status})`, details: text }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await resp.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("plant-health error:", e);
    return new Response(
      JSON.stringify({ 
        error: "Service temporarily unavailable. Please try again later.",
        details: e instanceof Error ? e.message : "Unknown error" 
      }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
