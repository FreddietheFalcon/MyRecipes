import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import Sidebar from "../components/Sidebar";
import api from "../lib/axios";
import toast from "react-hot-toast";

const FriendRecipeDetailPage = () => {
  const { friendId, recipeId } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [friend, setFriend] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/friends/${friendId}/recipes`);
        setFriend(res.data.friend);
        const found = res.data.recipes.find((r) => r._id.toString() === recipeId);
        if (!found) toast.error("Recipe not found");
        else setRecipe(found);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load recipe");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [friendId, recipeId]);

  if (loading) {
    return (
      <div className="shell">
        <Sidebar />
        <main className="main-card" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ color: "var(--gray)" }}>Loading...</div>
        </main>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="shell">
        <Sidebar />
        <main className="main-card">
          <Link to="/" className="btn-back">‹ Back</Link>
          <p style={{ color: "var(--gray)", marginTop: 20 }}>Recipe not found.</p>
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
              <h1 style={{ fontFamily: "'Pacifico', cursive", fontSize: 24, color: "var(--text)", margin: 0 }}>
                {recipe.name}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <span style={{
                  background: "#f0f4ff", color: "#3b6fd4",
                  border: "1.5px solid #a0b8f0",
                  borderRadius: 50, padding: "4px 12px",
                  fontSize: 11, fontWeight: 800,
                  textTransform: "uppercase", letterSpacing: ".04em",
                }}>
                  👁 View Only
                </span>
                <span style={{ fontSize: 12, color: "var(--gray)", fontWeight: 600 }}>
                  by {friend?.email}
                </span>
              </div>
            </div>
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
            {recipe.ingredients?.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--gray)" }}>No ingredients listed.</p>
            )}
            {recipe.ingredients?.map((ing, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between",
                padding: "10px 14px", marginBottom: 6,
                background: "var(--gray-light)", borderRadius: 10,
                fontSize: 14, fontWeight: 600, color: "var(--text)",
              }}>
                <span>{ing.name}</span>
                <span style={{ color: "var(--gray)" }}>{ing.amount}</span>
              </div>
            ))}
          </div>

          {/* Right: Steps + Comments */}
          <div>
            <div className="section-heading">Instructions</div>
            {recipe.steps?.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--gray)" }}>No steps listed.</p>
            )}
            {recipe.steps?.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: "var(--green)", color: "white",
                  fontSize: 12, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginTop: 2,
                }}>
                  {i + 1}
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", lineHeight: 1.6, margin: 0 }}>
                  {step}
                </p>
              </div>
            ))}

            {recipe.comments?.length > 0 && (
              <>
                <div className="section-heading" style={{ marginTop: 24 }}>Comments</div>
                {recipe.comments.map((c, i) => (
                  <div key={i} style={{
                    background: "#fffdf4", border: "1.5px solid #f0e8c0",
                    borderRadius: 12, padding: "12px 14px", marginBottom: 8,
                  }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#8a7a40", fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>
                      {c.text}
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default FriendRecipeDetailPage;
