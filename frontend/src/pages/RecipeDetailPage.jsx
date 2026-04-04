import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router";
import toast from "react-hot-toast";
import api from "../lib/axios";
import { LoaderIcon } from "lucide-react";
import Sidebar from "../components/Sidebar";

// ── Frontend validation ───────────────────────────────────────────────────────
const SAFE_TEXT_REGEX = /^[a-zA-Z0-9\u00C0-\u024F\s'"!?.,\-_()\&@#%+=*/~]+$/;

function validateName(text, fieldName = "Name") {
  if (!text?.trim()) return `${fieldName} cannot be empty`;
  if (text.length > 100) return `${fieldName} must be 100 characters or less`;
  if (!SAFE_TEXT_REGEX.test(text)) return `${fieldName} contains invalid characters`;
  return null;
}

function validateComment(text) {
  if (!text?.trim()) return null;
  if (text.length > 500) return "Comment must be 500 characters or less";
  if (!SAFE_TEXT_REGEX.test(text)) return "Comment contains invalid characters (< > { } [ ] are not allowed)";
  return null;
}

const RecipeDetailPage = () => {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await api.get(`/recipes/${id}`);
        setRecipe(res.data);
      } catch (error) {
        toast.error("Failed to fetch the recipe");
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;
    try {
      await api.delete(`/recipes/${id}`);
      toast.success("Recipe deleted");
      navigate("/");
    } catch { toast.error("Failed to delete"); }
  };

  const handleSave = async () => {
    // Validate name
    const nameError = validateName(recipe.name, "Recipe name");
    if (nameError) { toast.error(nameError); return; }

    // Validate comments
    for (let i = 0; i < (recipe.comments || []).length; i++) {
      const commentError = validateComment(recipe.comments[i].text);
      if (commentError) { toast.error(`Comment ${i + 1}: ${commentError}`); return; }
    }

    setSaving(true);
    try {
      await api.put(`/recipes/${id}`, recipe);
      toast.success("Recipe saved!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save");
    } finally { setSaving(false); }
  };

  const handleSetStatus = (newStatus) => {
    if (recipe.status === newStatus) return;
    setRecipe({ ...recipe, status: newStatus });
  };

  // Comment helpers — all local state, saved with Save Changes
  const addComment = () => {
    setRecipe({ ...recipe, comments: [...(recipe.comments || []), { text: "" }] });
  };

  const updateComment = (i, val) => {
    const updated = [...recipe.comments];
    updated[i] = { ...updated[i], text: val };
    setRecipe({ ...recipe, comments: updated });
  };

  const removeComment = (i) => {
    setRecipe({ ...recipe, comments: recipe.comments.filter((_, idx) => idx !== i) });
  };

  if (loading) {
    return (
      <div className="shell">
        <Sidebar />
        <main className="main-card" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <LoaderIcon style={{ animation: "spin 1s linear infinite", width: 36, height: 36 }} />
        </main>
      </div>
    );
  }

  return (
    <div className="shell">
      <Sidebar />
      <main className="main-card">

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Link to="/" className="btn-back">‹</Link>
            <div>
              <input
                style={{ fontFamily: "'Pacifico', cursive", fontSize: 24, color: "var(--text)", border: "none", outline: "none", background: "transparent", width: "100%" }}
                value={recipe.name}
                onChange={(e) => setRecipe({ ...recipe, name: e.target.value })}
              />

              {/* Status selector */}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button
                  onClick={() => handleSetStatus("keeper")}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    background: recipe.status === "keeper" ? "var(--green-light)" : "transparent",
                    border: `1.5px solid ${recipe.status === "keeper" ? "var(--green)" : "var(--gray-mid)"}`,
                    borderRadius: 50, padding: "5px 14px",
                    fontSize: 12, fontWeight: 800,
                    color: recipe.status === "keeper" ? "var(--green-dark)" : "var(--gray)",
                    cursor: recipe.status === "keeper" ? "default" : "pointer",
                    fontFamily: "'Nunito', sans-serif",
                    textTransform: "uppercase", letterSpacing: ".04em",
                    transition: "all .2s",
                  }}
                >⭐ Keeper</button>
                <button
                  onClick={() => handleSetStatus("want_to_try")}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    background: recipe.status === "want_to_try" ? "var(--orange-light)" : "transparent",
                    border: `1.5px solid ${recipe.status === "want_to_try" ? "var(--orange)" : "var(--gray-mid)"}`,
                    borderRadius: 50, padding: "5px 14px",
                    fontSize: 12, fontWeight: 800,
                    color: recipe.status === "want_to_try" ? "var(--orange)" : "var(--gray)",
                    cursor: recipe.status === "want_to_try" ? "default" : "pointer",
                    fontFamily: "'Nunito', sans-serif",
                    textTransform: "uppercase", letterSpacing: ".04em",
                    transition: "all .2s",
                  }}
                >🕐 Save for Later</button>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "✓ Save Changes"}
            </button>
            <button onClick={handleDelete} className="btn-ghost" style={{ color: "var(--red)", borderColor: "#ffdcdd" }}>
              🗑 Delete
            </button>
          </div>
        </div>

        <div style={{ height: "1.5px", background: "var(--gray-mid)", marginBottom: 24 }} />

        {/* Meta chips */}
        <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap", alignItems: "center" }}>
          <div className="meta-chip" style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px" }}>
            <span>👥</span>
            <input
              type="number"
              min="1"
              value={recipe.servings || ""}
              onChange={(e) => setRecipe({ ...recipe, servings: e.target.value ? Number(e.target.value) : "" })}
              placeholder="Servings"
              style={{
                width: 52, border: "none", outline: "none", background: "transparent",
                fontSize: 13, fontWeight: 700, fontFamily: "'Nunito', sans-serif",
                color: "var(--text)", textAlign: "center",
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 700 }}>servings</span>
          </div>
          {recipe.ingredients?.length > 0 && <div className="meta-chip">🥘 {recipe.ingredients.length} ingredients</div>}
          {recipe.steps?.length > 0 && <div className="meta-chip">📋 {recipe.steps.length} steps</div>}
        </div>

        {/* Two column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 32, alignItems: "start" }}>

          {/* Left: Ingredients */}
          <div>
            <div className="section-heading">Ingredients</div>
            {recipe.ingredients?.map((ing, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <div className="input-wrap" style={{ flex: 1 }}>
                  <input type="text" placeholder="Ingredient" value={ing.name}
                    onChange={(e) => {
                      const updated = [...recipe.ingredients];
                      updated[i] = { ...updated[i], name: e.target.value };
                      setRecipe({ ...recipe, ingredients: updated });
                    }}
                  />
                </div>
                <div className="input-wrap" style={{ width: 90 }}>
                  <input type="text" placeholder="Amount" value={ing.amount}
                    onChange={(e) => {
                      const updated = [...recipe.ingredients];
                      updated[i] = { ...updated[i], amount: e.target.value };
                      setRecipe({ ...recipe, ingredients: updated });
                    }}
                  />
                </div>
                <button type="button" onClick={() => setRecipe({ ...recipe, ingredients: recipe.ingredients.filter((_, idx) => idx !== i) })}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)", fontSize: 16 }}>✕</button>
              </div>
            ))}
            <button type="button" className="btn-ghost" style={{ marginTop: 4, fontSize: 13 }}
              onClick={() => setRecipe({ ...recipe, ingredients: [...(recipe.ingredients || []), { name: "", amount: "" }] })}>
              + Add Ingredient
            </button>
          </div>

          {/* Right: Steps + Comments */}
          <div>
            <div className="section-heading">Instructions</div>
            {recipe.steps?.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--green)", color: "white", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  {i + 1}
                </div>
                <div className="textarea-wrap" style={{ flex: 1 }}>
                  <textarea value={step} rows={2}
                    onChange={(e) => {
                      const updated = [...recipe.steps];
                      updated[i] = e.target.value;
                      setRecipe({ ...recipe, steps: updated });
                    }}
                  />
                </div>
                <button type="button" onClick={() => setRecipe({ ...recipe, steps: recipe.steps.filter((_, idx) => idx !== i) })}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)", fontSize: 16, marginTop: 4 }}>✕</button>
              </div>
            ))}
            <button type="button" className="btn-ghost" style={{ fontSize: 13, marginBottom: 28 }}
              onClick={() => setRecipe({ ...recipe, steps: [...(recipe.steps || []), ""] })}>
              + Add Step
            </button>

            {/* Comments — all local, saved with Save Changes */}
            <div className="section-heading">Comments / Notes</div>
            {(recipe.comments || []).length === 0 && (
              <p style={{ fontSize: 13, color: "var(--gray)", marginBottom: 12 }}>No comments yet.</p>
            )}
            {(recipe.comments || []).map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <div className="input-wrap" style={{ flex: 1, background: "#fffdf4", borderColor: "#f0e8c0" }}>
                  <input
                    type="text"
                    placeholder="e.g. Add more garlic next time"
                    value={c.text}
                    onChange={(e) => updateComment(i, e.target.value)}
                    maxLength={500}
                    style={{ fontStyle: "italic", color: "#8a7a40" }}
                  />
                </div>
                <button type="button" onClick={() => removeComment(i)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)", fontSize: 16 }}>✕</button>
              </div>
            ))}
            <button type="button" className="btn-ghost" style={{ fontSize: 13 }}
              onClick={addComment}>
              + Add Comment
            </button>
          </div>
        </div>

        {/* Save reminder */}
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1.5px solid var(--gray-mid)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Link to="/" className="btn-ghost">Cancel</Link>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "✓ Save Changes"}
          </button>
        </div>

      </main>
    </div>
  );
};

export default RecipeDetailPage;
