// api/saved-books.js
const { createClient } = require("@supabase/supabase-js");

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = async function handler(req, res) {
  setCors(res);

  // CORS preflight
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed. Use GET." });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({
      error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.",
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // optional: /api/saved-books?limit=25
  const limit = Math.min(parseInt(req.query.limit || "50", 10), 100);

  try {
    const { data, error } = await supabase
      .from("saved_books")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return res.status(200).json({
      count: data.length,
      saved_books: data,
    });
  } catch (err) {
    console.error("saved-books error:", err);
    return res.status(500).json({ error: err.message || "Unknown server error" });
  }
};
