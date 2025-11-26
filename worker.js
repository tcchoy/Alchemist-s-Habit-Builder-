export default {
  async fetch(request, env, ctx) {
    // CORS Headers allow the browser app to talk to this worker
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Handle Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 1. Security: Authorization Check
    const authHeader = request.headers.get("Authorization");
    // We expect "Bearer <YOUR_SECRET_TOKEN>"
    const expectedToken = `Bearer ${env.API_TOKEN}`;

    // Check if API_TOKEN is set in Cloudflare secrets
    if (!env.API_TOKEN) {
      return new Response(JSON.stringify({ error: "Server Error: API_TOKEN not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Verify Token
    if (!authHeader || authHeader !== expectedToken) {
      return new Response(JSON.stringify({ error: "Unauthorized: Invalid Token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const STORAGE_KEY = "FRONTEND_STATE_KEY";

    try {
      // 2. POST: Save Data
      if (request.method === "POST") {
        const data = await request.text();
        
        if (!data) {
           return new Response(JSON.stringify({ error: "Empty body" }), { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          });
        }

        // Save to KV binding "MY_SYNC_DATA"
        await env.MY_SYNC_DATA.put(STORAGE_KEY, data);
        
        return new Response(JSON.stringify({ success: true, message: "Data saved to cloud" }), { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }

      // 3. GET: Load Data
      if (request.method === "GET") {
        const data = await env.MY_SYNC_DATA.get(STORAGE_KEY);
        
        if (!data) {
          return new Response(JSON.stringify({ error: "No save data found" }), { 
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