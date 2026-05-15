import Anthropic from "@anthropic-ai/sdk";
import mammoth from "mammoth";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Shared: ask Claude to extract recipe from text ────────────────────────────
async function extractRecipeFromText(text, translate) {
  const languageInstruction = translate
    ? "Translate everything to English."
    : "Keep the original language as-is.";

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `Extract the recipe from this text and return ONLY a JSON object with no markdown, no explanation, just raw JSON.

${languageInstruction}

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

Text:
${text}`
    }]
  });

  const raw = message.content[0].text.trim();
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ── POST /api/import/url ──────────────────────────────────────────────────────
export async function importFromUrl(req, res) {
  try {
    const { url, translate } = req.body;
    if (!url) return res.status(400).json({ message: "URL is required" });

    const pageRes = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RecipeImporter/1.0)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!pageRes.ok) return res.status(400).json({ message: "Could not fetch that URL. Make sure it is a public recipe page." });

    const html = await pageRes.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);

    const recipe = await extractRecipeFromText(text, translate);
    res.status(200).json(recipe);
  } catch (error) {
    console.error("Error in importFromUrl", error);
    if (error.name === "TimeoutError") return res.status(408).json({ message: "The URL took too long to load." });
    if (error instanceof SyntaxError) return res.status(422).json({ message: "Could not parse the recipe from that page." });
    res.status(500).json({ message: "Failed to import recipe. Try a different URL." });
  }
}

// ── POST /api/import/file ─────────────────────────────────────────────────────
// Accepts PDF or Word (.docx) file uploads
export async function importFromFile(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { translate } = req.body;
    const { mimetype, buffer, originalname } = req.file;
    let text = "";

    if (mimetype === "application/pdf" ||
        originalname.toLowerCase().endsWith(".pdf")) {
      // Send PDF directly to Claude using document API
      const base64 = buffer.toString("base64");
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64,
              },
            },
            {
              type: "text",
              text: `Extract the recipe from this document and return ONLY a JSON object with no markdown, no explanation, just raw JSON.

${translate ? "Translate everything to English." : "Keep the original language as-is."}

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
- Each step should be a complete sentence`,
            }
          ],
        }]
      });

      const raw = message.content[0].text.trim();
      const clean = raw.replace(/```json|```/g, "").trim();
      const recipe = JSON.parse(clean);
      return res.status(200).json(recipe);
    }

    if (mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        originalname.toLowerCase().endsWith(".docx")) {
      // Extract text from Word document
      const result = await mammoth.extractRawText({ buffer });
      text = result.value.slice(0, 8000);
    } else if (mimetype === "text/plain" || originalname.toLowerCase().endsWith(".txt")) {
      // Plain text — just decode the buffer
      text = buffer.toString("utf-8").slice(0, 8000);
    } else {
      return res.status(400).json({ message: "Only PDF, Word (.docx), and text (.txt) files are supported." });
    }

    const recipe = await extractRecipeFromText(text, translate);
    res.status(200).json(recipe);
  } catch (error) {
    console.error("Error in importFromFile", error);
    if (error instanceof SyntaxError) return res.status(422).json({ message: "Could not parse a recipe from that file." });
    res.status(500).json({ message: "Failed to import recipe from file." });
  }
}

// ── POST /api/import/text ─────────────────────────────────────────────────────
export async function importFromText(req, res) {
  try {
    const { text, translate } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "Text is required" });

    const recipe = await extractRecipeFromText(text.slice(0, 8000), translate);
    res.status(200).json(recipe);
  } catch (error) {
    console.error("Error in importFromText", error);
    if (error instanceof SyntaxError) return res.status(422).json({ message: "Could not parse a recipe from that text." });
    res.status(500).json({ message: "Failed to import recipe from text." });
  }
}
