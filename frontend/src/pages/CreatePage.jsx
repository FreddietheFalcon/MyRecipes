import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import api from "../lib/axios";
import Sidebar from "../components/Sidebar";

// ── Frontend validation (includes Japanese characters) ────────────────────────
const SAFE_TEXT_REGEX = /^[a-zA-Z0-9\u00C0-\u024F\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff\uff00-\uffef\s'"!?.,\-_()\&@#%+=*/~]+$/;

function validateName(text, fieldName = "Name") {
  if (!text?.trim()) return `${fieldName} cannot be empty`;
  if (text.length > 100) return `${fieldName} must be 100 characters or less`;
  if (!SAFE_TEXT_REGEX.test(text)) return `${fieldName} contains invalid characters`;
  return null;
}

function validateStep(text) {
  if (!text?.trim()) return null;
  if (text.length > 1000) return "Step must be 1000 characters or less";
  if (!SAFE_TEXT_REGEX.test(text)) return "Step contains invalid characters";
  return null;
}

function validateComment(text) {
  if (!text?.trim()) return null;
  if (text.length > 500) return "Comment must be 500 characters or less";
  if (!SAFE_TEXT_REGEX.test(text)) return "Comment contains invalid characters";
  return null;
}

const CreatePage = () => {
  const [name, setName] = useState("");
  const [servings, setServings] = useState("");
  const [status, setStatus] = useState("want_to_try");
  const [ingredients, setIngredients] = useState([{ name: "", amount: "" }]);
  const [steps, setSteps] = useState([""]);
  const [comments, setComments] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [translate, setTranslate] = useState(false);
  const [sourceUrl, setSourceUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [importingFile, setImportingFile] = useState(false);
  const navigate = useNavigate();

  const handleImport = async () => {
    if (!importUrl.trim()) { toast.error("Please enter a URL"); return; }
    if (!importUrl.startsWith("http")) { toast.error("Please enter a valid URL starting with http"); return; }

    setImporting(true);
    const toastId = toast.loading(translate ? "🔍 Importing and translating recipe..." : "🔍 Reading recipe from URL...");
    try {
      const res = await api.post("/import/url", { url: importUrl, translate });
      const recipe = res.data;
      setName(recipe.name || "");
      setServings(recipe.servings ? String(recipe.servings) : "");
      setIngredients(
        recipe.ingredients?.length
          ? recipe.ingredients.map((i) => ({ name: i.name || "", amount: i.amount || "" }))
          : [{ name: "", amount: "" }]
      );
      setSteps(recipe.steps?.length ? recipe.steps : [""]);
      setComments(recipe.notes ? [recipe.notes] : [""]);
      setSourceUrl(importUrl); // save the URL for reference
      toast.success("Recipe imported! Review and save.", { id: toastId });
      setImportUrl("");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to import recipe", { id: toastId });
    } finally {
      setImporting(false);
    }
  };

  const handleFileImport = async () => {
    if (!selectedFile) { toast.error("Please select a file"); return; }
    setImportingFile(true);
    const toastId = toast.loading(translate ? "📄 Reading and translating file..." : "📄 Reading recipe from file...");
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("translate", translate);
      const res = await api.post("/import/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const recipe = res.data;
      setName(recipe.name || "");
      setServings(recipe.servings ? String(recipe.servings) : "");
      setIngredients(
        recipe.ingredients?.length
          ? recipe.ingredients.map((i) => ({ name: i.name || "", amount: i.amount || "" }))
          : [{ name: "", amount: "" }]
      );
      setSteps(recipe.steps?.length ? recipe.steps : [""]);
      setComments(recipe.notes ? [recipe.notes] : [""]);
      toast.success("Recipe imported! Review and save.", { id: toastId });
      setSelectedFile(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to import file", { id: toastId });
    } finally {
      setImportingFile(false);
    }
  };

  const updateIngredient = (i, field, val) => {
    const updated = [...ingredients];
    updated[i] = { ...updated[i], [field]: val };
    setIngredients(updated);
  };

  const updateStep = (i, val) => {
    const updated = [...steps];
    updated[i] = val;
    setSteps(updated);
  };

  const updateComment = (i, val) => {
    const updated = [...comments];
    updated[i] = val;
    setComments(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameError = validateName(name, "Recipe name");
    if (nameError) { toast.error(nameError); return; }

    for (const ing of ingredients) {
      if (ing.name.trim()) {
        const ingNameError = validateName(ing.name, "Ingredient name");
        if (ingNameError) { toast.error(ingNameError); return; }
        if (ing.amount.trim()) {
          const ingAmountError = validateName(ing.amount, "Ingredient amount");
          if (ingAmountError) { toast.error(ingAmountError); return; }
        }
      }
    }

    for (let i = 0; i < steps.length; i++) {
      const stepError = validateStep(steps[i]);
      if (stepError) { toast.error(`Step ${i + 1}: ${stepError}`); return; }
    }

    for (let i = 0; i < comments.length; i++) {
      const commentError = validateComment(comments[i]);
      if (commentError) { toast.error(`Comment ${i + 1}: ${commentError}`); return; }
    }

    setLoading(true);
    try {
      await api.post("/recipes", {
        name,
        servings: servings ? Number(servings) : undefined,
        status,
        ingredients: ingredients.filter((i) => i.name.trim()),
        steps: steps.filter((s) => s.trim()),
        comments: comments.filter((c) => c.trim()).map((text) => ({ text })),
        sourceUrl: sourceUrl || undefined,
      });
      toast.success("Recipe created!");
      navigate("/");
    } catch (error) {
      if (error.response?.status === 429) toast.error("Slow down! Too many recipes.", { duration: 4000, icon: "⚠️" });
      else toast.error(error.response?.data?.message || "Failed to create recipe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shell">
      <Sidebar />
      <main className="main-card">

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <Link to="/" className="btn-back">‹</Link>
          <h1 className="page-title">Add New Recipe</h1>
        </div>

        {/* URL Import */}
        <div style={{
          background: "var(--gray-light)", border: "1.5px solid var(--gray-mid)",
          borderRadius: 16, padding: "16px 20px", marginBottom: 28,
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text)", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>
            🔗 Import from URL
          </div>
          <p style={{ fontSize: 12, color: "var(--gray)", fontWeight: 600, marginBottom: 12 }}>
            Paste a link to any recipe webpage and we'll fill in the form automatically. Works with Japanese recipe sites too!
          </p>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div className="input-wrap" style={{ flex: 1 }}>
              <input
                type="url"
                placeholder="https://www.allrecipes.com/recipe/... or Japanese recipe URL"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleImport())}
              />
            </div>
            <button
              type="button"
              onClick={handleImport}
              disabled={importing}
              className="btn-primary"
              style={{ opacity: importing ? 0.7 : 1, cursor: importing ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}
            >
              {importing ? "Importing..." : "Import"}
            </button>
          </div>
          {/* Translate toggle */}
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
            <input
              type="checkbox"
              checked={translate}
              onChange={(e) => setTranslate(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: "var(--green)", cursor: "pointer" }}
            />
            Translate recipe to English
          </label>
        </div>

        {/* File Import */}
        <div style={{
          background: "var(--gray-light)", border: "1.5px solid var(--gray-mid)",
          borderRadius: 16, padding: "16px 20px", marginBottom: 20,
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text)", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>
            📄 Import from PDF or Word
          </div>
          <p style={{ fontSize: 12, color: "var(--gray)", fontWeight: 600, marginBottom: 12 }}>
            Upload a PDF or Word (.docx) file containing a recipe.
          </p>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <label style={{
              flex: 1, display: "flex", alignItems: "center", gap: 8,
              padding: "10px 14px", border: "1.5px dashed var(--gray-mid)",
              borderRadius: 10, cursor: "pointer", background: "#fff",
              fontSize: 13, fontWeight: 600, color: "var(--gray)",
            }}>
              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                style={{ display: "none" }}
                onChange={(e) => setSelectedFile(e.target.files[0] || null)}
              />
              {selectedFile ? `📄 ${selectedFile.name}` : "Choose PDF or Word file..."}
            </label>
            <button
              type="button"
              onClick={handleFileImport}
              disabled={importingFile || !selectedFile}
              className="btn-primary"
              style={{ opacity: (importingFile || !selectedFile) ? 0.5 : 1, cursor: (importingFile || !selectedFile) ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}
            >
              {importingFile ? "Importing..." : "Import"}
            </button>
          </div>
        </div>

        {/* Source URL display (after import) */}
        {sourceUrl && (
          <div style={{
            background: "#f0f4ff", border: "1px solid #a0b8f0",
            borderRadius: 10, padding: "8px 14px", marginBottom: 20,
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 12, fontWeight: 600, color: "#3b6fd4",
          }}>
            🔗 Source:{" "}
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer"
              style={{ color: "#3b6fd4", textDecoration: "underline", wordBreak: "break-all" }}>
              {sourceUrl}
            </a>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Name */}
          <div className="field">
            <label className="field-label">Recipe Name</label>
            <div className="input-wrap">
              <input type="text" placeholder="e.g. Grandma's Lasagna" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          </div>

          {/* Servings + Status */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field-label">Servings</label>
              <div className="input-wrap">
                <input type="number" placeholder="e.g. 4" value={servings} onChange={(e) => setServings(e.target.value)} min="1" />
              </div>
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field-label">Status</label>
              <div className="input-wrap">
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="keeper">⭐ Keeper</option>
                  <option value="want_to_try">🕐 Save for Later</option>
                </select>
                <span style={{ color: "var(--gray)", fontSize: 13, pointerEvents: "none" }}>▾</span>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="field">
            <label className="field-label">Ingredients</label>
            {ingredients.map((ing, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <div className="input-wrap" style={{ flex: 1 }}>
                  <input type="text" placeholder="Ingredient name" value={ing.name} onChange={(e) => updateIngredient(i, "name", e.target.value)} />
                </div>
                <div className="input-wrap" style={{ width: 110 }}>
                  <input type="text" placeholder="e.g. 1 cup" value={ing.amount} onChange={(e) => updateIngredient(i, "amount", e.target.value)} />
                </div>
                {ingredients.length > 1 && (
                  <button type="button" onClick={() => setIngredients(ingredients.filter((_, idx) => idx !== i))}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)", fontSize: 18, padding: "0 4px" }}>✕</button>
                )}
              </div>
            ))}
            <button type="button" className="btn-ghost" style={{ marginTop: 4, fontSize: 13 }}
              onClick={() => setIngredients([...ingredients, { name: "", amount: "" }])}>
              + Add Ingredient
            </button>
          </div>

          {/* Steps */}
          <div className="field">
            <label className="field-label">Steps</label>
            {steps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                <span style={{ marginTop: 14, color: "var(--gray)", fontSize: 13, minWidth: 20, fontWeight: 700 }}>{i + 1}.</span>
                <div className="textarea-wrap" style={{ flex: 1 }}>
                  <textarea placeholder={`Step ${i + 1}`} value={step} onChange={(e) => updateStep(i, e.target.value)} rows={2} maxLength={1000} />
                </div>
                {steps.length > 1 && (
                  <button type="button" onClick={() => setSteps(steps.filter((_, idx) => idx !== i))}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)", fontSize: 18, marginTop: 8 }}>✕</button>
                )}
              </div>
            ))}
            <button type="button" className="btn-ghost" style={{ marginTop: 4, fontSize: 13 }}
              onClick={() => setSteps([...steps, ""])}>
              + Add Step
            </button>
          </div>

          {/* Comments */}
          <div className="field">
            <label className="field-label">Comments / Notes</label>
            {comments.map((comment, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <div className="input-wrap" style={{ flex: 1 }}>
                  <input
                    type="text"
                    placeholder="e.g. Add more garlic next time"
                    value={comment}
                    onChange={(e) => updateComment(i, e.target.value)}
                    maxLength={500}
                  />
                </div>
                {comments.length > 1 && (
                  <button type="button" onClick={() => setComments(comments.filter((_, idx) => idx !== i))}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)", fontSize: 18, padding: "0 4px" }}>✕</button>
                )}
              </div>
            ))}
            <button type="button" className="btn-ghost" style={{ marginTop: 4, fontSize: 13 }}
              onClick={() => setComments([...comments, ""])}>
              + Add Comment
            </button>
          </div>

          <div className="section-divider" />

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Link to="/" className="btn-ghost">Cancel</Link>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Recipe"}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
};

export default CreatePage;
