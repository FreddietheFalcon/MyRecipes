import { useState, useEffect } from "react";
import { Link } from "react-router";
import { LoaderIcon, RotateCcwIcon } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/axios";
import Sidebar from "../components/Sidebar";
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
      <div className="shell">
        <Sidebar />
        <main className="main-card" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <LoaderIcon style={{ width: 36, height: 36, animation: "spin 1s linear infinite", color: "#7ed321" }} />
        </main>
      </div>
    );
  }

  return (
    <div className="shell">
      <Sidebar />
      <main className="main-card">

        {/* Header */}
        <div style={{ marginBottom: 8 }}>
          <h1 className="page-title">♻️ Recover Deleted Recipes</h1>
        </div>
        <p style={{ fontSize: 13, color: "var(--gray)", fontWeight: 600, marginBottom: 28 }}>
          Deleted recipes are kept for <strong style={{ color: "var(--text)" }}>30 days</strong> before
          being permanently removed. Restore any time before expiry.
        </p>

        {/* Empty state */}
        {trashedRecipes.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px 20px", color: "var(--gray)" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🗑️</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
              Trash is empty
            </h3>
            <p style={{ fontSize: 14, fontWeight: 600 }}>
              Deleted recipes will appear here for 30 days.
            </p>
            <Link to="/" style={{
              display: "inline-block", marginTop: 20,
              background: "var(--green)", color: "#fff",
              borderRadius: 50, padding: "11px 28px",
              fontWeight: 800, fontSize: 14, textDecoration: "none",
              boxShadow: "0 3px 12px rgba(126,211,33,.35)",
            }}>← Back to Recipes</Link>
          </div>
        )}

        {/* Recipe cards */}
        {trashedRecipes.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {trashedRecipes.map((recipe) => {
              const colors = daysColor(recipe.daysRemaining);
              const isRestoring = restoringId === recipe._id;
              return (
                <div key={recipe._id} style={{
                  border: "1.5px solid #e4e9ef",
                  borderLeft: `4px solid ${colors.badge}`,
                  borderRadius: 16,
                  padding: "18px 22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  background: "#fafffe",
                }}>

                  {/* Left: title + deleted date */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontSize: 16,
                      fontWeight: 800,
                      fontFamily: "'Pacifico', cursive",
                      color: "#9aa0a8",
                      textDecoration: "line-through",
                      textDecorationColor: colors.badge,
                      marginBottom: 4,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {recipe.name}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--gray)", fontWeight: 600 }}>
                      🗑 Deleted {formatDate(new Date(recipe.deletedAt))}
                    </div>
                  </div>

                  {/* Middle: days remaining badge */}
                  <div style={{
                    background: colors.bg,
                    color: colors.text,
                    borderRadius: 50,
                    padding: "4px 14px",
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}>
                    {recipe.daysRemaining === 0 ? "Expires today" : `${recipe.daysRemaining}d left`}
                  </div>

                  {/* Right: Restore button */}
                  <button
                    disabled={isRestoring}
                    onClick={() => handleRestore(recipe._id, recipe.name)}
                    style={{
                      display: "flex", alignItems: "center", gap: 7,
                      background: "#7ed321", color: "#fff",
                      border: "none", borderRadius: 50,
                      padding: "10px 20px",
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: 13, fontWeight: 800,
                      cursor: isRestoring ? "not-allowed" : "pointer",
                      opacity: isRestoring ? 0.7 : 1,
                      boxShadow: "0 3px 10px rgba(126,211,33,.3)",
                      flexShrink: 0,
                      transition: "background .2s",
                    }}
                    onMouseEnter={e => { if (!isRestoring) e.currentTarget.style.background = "#5aaa10"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#7ed321"; }}
                  >
                    {isRestoring
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
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default TrashPage;
