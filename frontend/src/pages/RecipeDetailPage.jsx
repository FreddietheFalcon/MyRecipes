import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router";
import toast from "react-hot-toast";
import api from "../lib/axios";
import { LoaderIcon } from "lucide-react";
import Sidebar from "../components/Sidebar";

// ── Frontend input validation ─────────────────────────────────────────────────
const SAFE_TEXT_REGEX = /^[a-zA-Z0-9\u00C0-\u024F\s'"!?.,\-_()\&@#%+=*/~]+$/;

function validateComment(text) {
  if (!text?.trim()) return "Comment cannot be empty";
  if (text.length > 500) return "Comment must be 500 characters or less";
  if (!SAFE_TEXT_REGEX.test(text)) return "Comment contains invalid characters (< > { } [ ] are not allowed)";
  return null; // null = valid
}

function validateName(text, fieldName = "Name") {
  if (!text?.trim()) return `${fieldName} cannot be empty`;
  if (text.length > 100) return `${fieldName} must be 100 characters or less`;
  if (!SAFE_TEXT_REGEX.test(text)) return `${fieldName} contains invalid characters`;
  return null;
}

// ── Component ─────────────────────────────────────────────────────────────────
const RecipeDetailPage = () => {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [addingComment, setAddingComment] = useState(false);
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
    const nameError = validateName(recipe.name, "Recipe name");
    if (nameError) { toast.error(nameError); return; }
    setSaving(true);
    try {
      await api.put(`/recipes/${id}`, recipe);
      toast.success("Recipe saved!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save");
    } finally { setSaving(false); }
  };

  const handleSetStatus = async (newStatus) => {
    if (recipe.status === newStatus) return;
    try {
      const res = await api.put(`/recipes/${id}`, { ...recipe, status: newStatus });
      setRecipe(res.data);
      toast.success(newStatus === "keeper" ? "Moved to Keepers ⭐" : "Moved to Save for Later 🕐");
    } catch { toast.error("Failed to update status"); }
  };

  const handleCommentChange = (e) => {
    const val = e.target.value;
    setNewComment(val);
    // Live validation feedback
    if (val) {
      const error = validateComment(val);
      setCommentError(error || "");
    } else {
      setCommentError("");
    }
  };

  const handleAddComment = async () => {
    const error = validateComment(newComment);
    if (error) { toast.error(error); return; }
    setAddingComment(true);
    try {
      const res = await api.post(`/recipes/${id}/comments`, { text: newComment });
      setRecipe(res.data);
      setNewComment("");
      setCommentError("");
      toast.success("Comment added");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add comment");
    } finally { setAddingComment(false); }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await api.delete(`/recipes/${id}/comments/${commentId}`);
      setRecipe(res.data);
    } catch { toast.error("Failed to delete comment"); }
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

              {/* Status selector — two visible buttons */}
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
                >
                  ⭐ Keeper
                </button>
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
                >
                  🕐 Save for Later
                </button>
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
        <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
          {recipe.servings && <div className="meta-chip">👥 {recipe.servings} servings</div>}
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

            {/* Comments */}
            <div className="section-heading">Comments</div>
            {recipe.comments?.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--gray)", marginBottom: 12 }}>No comments yet.</p>
            )}
            {recipe.comments?.map((c) => (
              <div key={c._id} style={{ background: "#fffdf4", border: "1.5px solid #f0e8c0", borderRadius: 12, padding: "12px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#8a7a40", fontStyle: "italic", lineHeight: 1.7 }}>{c.text}</p>
                <button onClick={() => handleDeleteComment(c._id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)", fontSize: 14, flexShrink: 0 }}>✕</button>
              </div>
            ))}

            {/* Comment input with live validation */}
            <div style={{ marginTop: 8 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <div className="input-wrap" style={{ flex: 1, borderColor: commentError ? "var(--red)" : undefined }}>
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={handleCommentChange}
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                    maxLength={500}
                  />
                </div>
                <button className="btn-primary" onClick={handleAddComment} disabled={addingComment || !!commentError}>
                  {addingComment ? "..." : "Add"}
                </button>
              </div>
              {/* Live error message */}
              {commentError && (
                <p style={{ fontSize: 11, color: "var(--red)", fontWeight: 700, marginTop: 4 }}>
                  ⚠ {commentError}
                </p>
              )}
              {/* Character counter */}
              <p style={{ fontSize: 11, color: newComment.length > 450 ? "var(--orange)" : "var(--gray)", fontWeight: 600, marginTop: 4, textAlign: "right" }}>
                {newComment.length}/500
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecipeDetailPage;
