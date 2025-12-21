import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { work_id, title, author, cover_url } = req.body;

    if (!work_id || !title) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data, error } = await supabase
      .from("saved_books")
      .insert([
        {
          work_id,
          title,
          author,
          cover_url
        }
      ])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ saved: data[0] });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}
