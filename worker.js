export default {
  async fetch(request, env, ctx) {
    // CORS Headers to allow browser requests
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Handle Preflight Requests
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 1. Authentication Check
    // The user enters a "Token" in the app settings.
    // We compare this against a secret set in Cloudflare (API_TOKEN).
    const authHeader = request.headers.get("Authorization");
    const expectedToken = `Bearer ${env.API_TOKEN}`;

    if (!authHeader || authHeader !== expectedToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    try {
      // 2. Save Data (POST)
      if (request.method === "POST") {
        const data = await request.text();
        
        // Store data in KV. Key is "user_save". 
        // If you want multi-user support, you'd need a more complex auth system.
        // For this personal app, a single key suffices.
        await env.GAME_SAVES.put("user_save", data);
        
        return new Response(JSON.stringify({ success: true }), { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }

      // 3. Load Data (GET)
      if (request.method === "GET") {
        const data = await env.GAME_SAVES.get("user_save");
        
        if (!data) {
          return new Response(JSON.stringify({ error: "No save found" }), { 
            status: 404, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          });
        }

        return new Response(data, { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }

      return new Response("Method not allowed", { status: 405, headers: corsHeaders });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
  },
};
