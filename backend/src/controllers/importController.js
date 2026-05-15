import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── POST /api/import/url ──────────────────────────────────────────────────────
export async function importFromUrl(req, res) {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: "URL is required" });

    // Fetch the page server-side (no CORS issues)
    const pageRes = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RecipeImporter/1.0)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!pageRes.ok) return res.status(400).json({ message: "Could not fetch that URL. Make sure it is a public recipe page." });

    const html = await pageRes.text();

    // Strip HTML to plain text
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);

    // Ask Claude to extract the recipe
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `Extract the recipe from this webpage text and return ONLY a JSON object with no markdown, no explanation, just raw JSON.

Format:
{
  "name": "Recipe Name",
  "servings": 4,
  "ingredients": [{"name": "flour", "amount": "2 cups"}],
  "steps": ["Step 1 text", "Step 2 text"],
  "notes": "Any tips or notes"
}

Rules:
- If servings is not mentioned use null
- If notes are not present use ""
- Keep ingredient names and amounts concise
- Each step should be a complete sentence

Webpage text:
${text}`
      }]
    });

    const raw = message.content[0].text.trim();
    const clean = raw.replace(/```json|```/g, "").trim();
    const recipe = JSON.parse(clean);

    res.status(200).json(recipe);
  } catch (error) {
    console.error("Error in importFromUrl", error);
    if (error.name === "TimeoutError") {
      return res.status(408).json({ message: "The URL took too long to load. Try a different recipe page." });
    }
    if (error instanceof SyntaxError) {
      return res.status(422).json({ message: "Could not parse the recipe from that page. Try a different URL." });
    }
    res.status(500).json({ message: "Failed to import recipe. Try a different URL." });
  }
}
