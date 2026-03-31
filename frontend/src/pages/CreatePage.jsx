import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import api from "../lib/axios";
import Sidebar from "../components/Sidebar";

// ── Frontend validation ───────────────────────────────────────────────────────
const SAFE_TEXT_REGEX = /^[a-zA-Z0-9\u00C0-\u024F\s'"!?.,\-_()\&@#%+=*/~]+$/;

function validateName(text, fieldName = "Name") {
  if (!text?.trim()) return `${fieldName} cannot be empty`;
  if (text.length > 100) return `${fieldName} must be 100 characters or less`;
  if (!SAFE_TEXT_REGEX.test(text)) return `${fieldName} contains invalid characters (< > { } [ ] are not allowed)`;
  return null;
}

function validateStep(text) {
  if (!text?.trim()) return null;
  if (text.length > 1000) return "Step must be 1000 characters or less";
  if (!SAFE_TEXT_REGEX.test(text)) return "Step contains invalid characters";
  return null;
}

// ── Component ─────────────────────────────────────────────────────────────────
const CreatePage = () => {
  const [name, setName] = useState("");
  const [servings, setServings] = useState("");
  const [status, setStatus] = useState("want_to_try");
  const [ingredients, setIngredients] = useState([{ name: "", amount: "" }]);
  const [steps, setSteps] = useState([""]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate recipe name
    const nameError = validateName(name, "Recipe name");
    if (nameError) { toast.error(nameError); return; }

    // Validate ingredient names and amounts
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

    // Validate steps
    for (let i = 0; i < steps.length; i++) {
      const stepError = validateStep(steps[i]);
      if (stepError) { toast.error(`Step ${i + 1}: ${stepError}`); return; }
    }

    setLoading(true);
    try {
      await api.post("/recipes", {
        name,
        servings: servings ? Number(servings) : undefined,
        status,
        ingredients: ingredients.filter((i) => i.name.trim()),
        steps: steps.filter((s) => s.trim()),
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
