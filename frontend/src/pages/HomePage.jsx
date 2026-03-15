import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import Sidebar from "../components/Sidebar";
import RateLimitedUI from "../components/RateLimitedUI";
import api from "../lib/axios";
import toast from "react-hot-toast";

const HomePage = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "keeper";

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await api.get("/recipes");
        setRecipes(res.data);
      } catch (error) {
        if (error.response?.status === 429) setIsRateLimited(true);
        else toast.error("Failed to load recipes");
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  const filtered = recipes.filter((r) => {
    const q = search.toLowerCase().trim();
    const matchTab = q ? true : r.status === tab;
    const matchSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.ingredients?.some((i) => i.name.toLowerCase().includes(q));
    return matchTab && matchSearch;
  });

  return (
    <div className="shell">
      <Sidebar />
      <main className="main-card" style={{ display: "flex", flexDirection: "column" }}>
        {isRateLimited && <RateLimitedUI />}

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
          <div className="search-wrap">
            <span style={{ color: "var(--gray)", fontSize: 17 }}>🔍</span>
            <input
              type="text"
              placeholder="Search by recipe or ingredients"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link to="/create" className="btn-outline-red">+ Add Recipe</Link>
        </div>

        {/* Tabs */}
        <div className="tabs-row">
          <Link to="/?tab=keeper" className={`tab-item ${tab === "keeper" ? "active" : ""}`}>Keepers</Link>
          <Link to="/?tab=want_to_try" className={`tab-item ${tab === "want_to_try" ? "active" : ""}`}>Save for Later</Link>
        </div>

        {/* Search label */}
        {search && (
          <div style={{ fontSize: 13, color: "var(--gray)", fontWeight: 600, marginBottom: 14 }}>
            Results for: <span style={{ color: "var(--green-dark)", fontWeight: 800 }}>"{search}"</span>
          </div>
        )}

        {loading && <div style={{ textAlign: "center", color: "var(--gray)", padding: "48px 0" }}>Loading recipes...</div>}

        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🍳</div>
            <div className="empty-title">No recipes found</div>
            <div className="empty-sub">Try a different search or add a new recipe.</div>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((r, i) => (
              <Link key={r._id} to={`/recipe/${r._id}`} className="recipe-pill" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="recipe-pill-left">
                  <div>
                    <div className="recipe-pill-name">{r.name}</div>
                    <div className="recipe-pill-meta">
                      {r.servings ? `👥 ${r.servings} servings` : ""}
                      {r.servings && r.ingredients?.length ? " · " : ""}
                      {r.ingredients?.length ? `🥘 ${r.ingredients.length} ingredients` : ""}
                    </div>
                  </div>
                </div>
                <div className="recipe-pill-right">
                  <span className={r.status === "keeper" ? "badge-keeper" : "badge-later"}>
                    {r.status === "keeper" ? "⭐ Keeper" : "🕐 Later"}
                  </span>
                  <span className="pill-arrow">›</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
