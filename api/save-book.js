// api/save-book.js
const { createClient } = require("@supabase/supabase-js");

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = async function handler(req, res) {
  setCors(res);

  // CORS preflight
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({
      error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.",
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // Vercel usually parses JSON body automatically when Content-Type: application/json.
    // But to be safe, handle string body too.
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const work_id = String(body?.work_id || "").trim();
    const title = String(body?.title || "").trim();
    const author = body?.author ? String(body.author).trim() : null;
    const cover_url = body?.cover_url ? String(body.cover_url).trim() : null;

    if (!work_id || !title) {
      return res.status(400).json({
        error: "Missing required fields: work_id, title",
      });
    }

    // Upsert prevents duplicates since you have a UNIQUE constraint on work_id
    const { data, error } = await supabase
      .from("saved_books")
      .upsert(
        [{ work_id, title, author, cover_url }],
        { onConflict: "work_id" }
      )
      .select("*")
      .single();

    if (error) throw error;

    return res.status(200).json({
      message: "Saved!",
      saved: data,
    });
  } catch (err) {
    console.error("save-book error:", err);
    return res.status(500).json({ error: err.message || "Unknown server error" });
  }
};
