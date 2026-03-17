import { useState, useEffect } from "react";
import { Link } from "react-router";
import { LoaderIcon, RotateCcwIcon } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/axios";
import { formatDate } from "../lib/utils";

const TrashPage = () => {
  const [trashedRecipes, setTrashedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState(null);

  useEffect(() => {
    const fetchTrash = async () => {
      try {
        const res = await api.get("/recipes/trash");
        setTrashedRecipes(res.data);
      } catch (error) {
        console.log("Error fetching trash:", error);
        toast.error("Failed to load trash");
      } finally {
        setLoading(false);
      }
    };
    fetchTrash();
  }, []);

  const handleRestore = async (id, title) => {
    setRestoringId(id);
    try {
      await api.put(`/recipes/${id}/restore`);
      setTrashedRecipes((prev) => prev.filter((r) => r._id !== id));
      toast.success(`"${title}" has been restored!`);
    } catch (error) {
      console.log("Error restoring recipe:", error);
      toast.error("Failed to restore recipe");
    } finally {
      setRestoringId(null);
    }
  };

  const daysColor = (days) => {
    if (days <= 3) return { badge: "#e5333a", bg: "#fff0f0", text: "#e5333a" };
    if (days <= 7) return { badge: "#e67e22", bg: "#fff3e0", text: "#e67e22" };
    return { badge: "#5aaa10", bg: "#e8f9d0", text: "#5aaa10" };
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <LoaderIcon style={{ width: 36, height: 36, animation: "spin 1s linear infinite", color: "#7ed321" }} />
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "'Nunito', sans-serif",
      background: "#f5f5f5",
      minHeight: "100vh",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: "24px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Pacifico&display=swap" rel="stylesheet" />

      <div style={{ display: "flex", gap: "24px", width: "100%", maxWidth: "1000px" }}>

        {/* ── Sidebar ── */}
        <aside style={{
          background: "#fff",
          border: "2.5px solid #7ed321",
          borderRadius: "22px",
          width: "220px",
          flexShrink: 0,
          padding: "32px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          boxShadow: "0 4px 24px rgba(126,211,33,0.13)",
          alignSelf: "flex-start",
          position: "sticky",
          top: "24px",
        }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
            <div style={{
              width: "42px", height: "42px", borderRadius: "50%",
              background: "#7ed321",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Pacifico', cursive",
              color: "#fff", fontSize: "15px",
              boxShadow: "0 3px 10px rgba(126,211,33,.35)",
            }}>R</div>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "#2c3e50" }}>My Recipes</span>
          </div>

          {/* Nav links */}
          {[
            { label: "🔍 Search",    to: "/" },
            { label: "⭐ Keepers",   to: "/" },
            { label: "🕐 Save for later", to: "/" },
            { label: "➕ Add Recipe", to: "/create" },
            { label: "🥫 Inventory", to: "/inventory" },
          ].map(({ label, to }) => (
            <Link key={label} to={to} style={{
              display: "block", padding: "9px 12px", borderRadius: "10px",
              color: "#b0b8c1", fontSize: "15px", fontWeight: 600,
              textDecoration: "none", transition: "background .2s, color .2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#e8f9d0"; e.currentTarget.style.color = "#5aaa10"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#b0b8c1"; }}
            >{label}</Link>
          ))}

          {/* Recover Deleted Recipes — active/highlighted */}
          <Link to="/trash" style={{
            display: "block", padding: "9px 12px", borderRadius: "10px",
            background: "#e8f9d0", color: "#5aaa10",
            fontSize: "15px", fontWeight: 700,
            textDecoration: "none", marginTop: "8px",
            border: "1.5px solid #7ed321",
          }}>
            ♻️ Recover Deleted
          </Link>

          <Link to="/" style={{
            display: "block", padding: "9px 12px", borderRadius: "10px",
            color: "#b0b8c1", fontSize: "15px", fontWeight: 600,
            textDecoration: "none",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "#e8f9d0"; e.currentTarget.style.color = "#5aaa10"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#b0b8c1"; }}
          >🚪 Logout</Link>
        </aside>

        {/* ── Main ── */}
        <main style={{
          flex: 1,
          background: "#fff",
          border: "2.5px solid #7ed321",
          borderRadius: "22px",
          padding: "36px 40px 48px",
          boxShadow: "0 4px 24px rgba(126,211,33,0.13)",
        }}>
          {/* Header */}
          <div style={{ marginBottom: "8px" }}>
            <h1 style={{ fontFamily: "'Pacifico', cursive", fontSize: "26px", color: "#5aaa10" }}>
              ♻️ Recover Deleted Recipes
            </h1>
          </div>
          <p style={{ fontSize: "13px", color: "#b0b8c1", fontWeight: 600, marginBottom: "24px" }}>
            Deleted recipes are kept for <strong style={{ color: "#2c3e50" }}>30 days</strong> before being permanently removed. Restore any time before expiry.
          </p>

          {/* Empty state */}
          {trashedRecipes.length === 0 && (
            <div style={{ textAlign: "center", padding: "64px 20px", color: "#b0b8c1" }}>
              <div style={{ fontSize: "52px", marginBottom: "16px" }}>🗑️</div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#2c3e50", marginBottom: "8px" }}>Trash is empty</h3>
              <p style={{ fontSize: "14px", fontWeight: 600 }}>Deleted recipes will appear here for 30 days.</p>
              <Link to="/" style={{
                display: "inline-block", marginTop: "20px",
                background: "#7ed321", color: "#fff",
                borderRadius: "50px", padding: "11px 28px",
                fontWeight: 800, fontSize: "14px", textDecoration: "none",
                boxShadow: "0 3px 12px rgba(126,211,33,.35)",
              }}>← Back to Recipes</Link>
            </div>
          )}

          {/* Recipe cards */}
          {trashedRecipes.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {trashedRecipes.map((recipe) => {
                const colors = daysColor(recipe.daysRemaining);
                return (
                  <div key={recipe._id} style={{
                    border: "1.5px solid #e4e9ef",
                    borderLeft: `4px solid ${colors.badge}`,
                    borderRadius: "16px",
                    padding: "18px 22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                    background: "#fafffe",
                    transition: "box-shadow .2s",
                  }}>
                    {/* Left: info */}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{
                        fontSize: "15px", fontWeight: 700, color: "#9aa0a8",
                        textDecoration: "line-through", marginBottom: "4px",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {recipe.title}
                      </div>
                      <div style={{ fontSize: "12px", color: "#b0b8c1", fontWeight: 600 }}>
                        Deleted {formatDate(new Date(recipe.deletedAt))}
                      </div>
                    </div>

                    {/* Middle: days remaining badge */}
                    <div style={{
                      background: colors.bg,
                      color: colors.text,
                      borderRadius: "50px",
                      padding: "4px 14px",
                      fontSize: "11px", fontWeight: 800,
                      textTransform: "uppercase", letterSpacing: ".04em",
                      whiteSpace: "nowrap", flexShrink: 0,
                    }}>
                      {recipe.daysRemaining === 0 ? "Expires today" : `${recipe.daysRemaining}d left`}
                    </div>

                    {/* Right: Restore button */}
                    <button
                      disabled={restoringId === recipe._id}
                      onClick={() => handleRestore(recipe._id, recipe.title)}
                      style={{
                        display: "flex", alignItems: "center", gap: "7px",
                        background: "#7ed321", color: "#fff",
                        border: "none", borderRadius: "50px",
                        padding: "10px 20px",
                        fontFamily: "'Nunito', sans-serif",
                        fontSize: "13px", fontWeight: 800,
                        cursor: restoringId === recipe._id ? "not-allowed" : "pointer",
                        opacity: restoringId === recipe._id ? 0.7 : 1,
                        boxShadow: "0 3px 10px rgba(126,211,33,.3)",
                        flexShrink: 0,
                        transition: "background .2s",
                      }}
                      onMouseEnter={e => { if (restoringId !== recipe._id) e.currentTarget.style.background = "#5aaa10"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#7ed321"; }}
                    >
                      {restoringId === recipe._id
                        ? <LoaderIcon style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                        : <RotateCcwIcon style={{ width: 14, height: 14 }} />
                      }
                      Restore
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default TrashPage;
