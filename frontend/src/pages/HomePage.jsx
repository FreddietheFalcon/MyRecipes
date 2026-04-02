import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import Sidebar from "../components/Sidebar";
import RateLimitedUI from "../components/RateLimitedUI";
import api from "../lib/axios";
import toast from "react-hot-toast";

const HomePage = () => {
  const [myRecipes, setMyRecipes] = useState([]);
  const [friendRecipes, setFriendRecipes] = useState([]); // [{ recipe, friendEmail, friendId }]
  const [loading, setLoading] = useState(true);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "all";

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Fetch my recipes
        const myRes = await api.get("/recipes");
        setMyRecipes(myRes.data);

        // Fetch accepted friends and their recipes
        const friendsRes = await api.get("/friends");
        const accepted = friendsRes.data.filter((f) => f.status === "accepted");

        const friendData = await Promise.all(
          accepted.map(async (f) => {
            try {
              const res = await api.get(`/friends/${f.friend._id}/recipes`);
              return res.data.recipes.map((r) => ({
                recipe: r,
                friendEmail: f.friend.email,
                friendId: f.friend._id,
              }));
            } catch {
              return [];
            }
          })
        );
        setFriendRecipes(friendData.flat());
      } catch (error) {
        if (error.response?.status === 429) setIsRateLimited(true);
        else toast.error("Failed to load recipes");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Combine all recipes for filtering
  const allRecipes = [
    ...myRecipes.map((r) => ({ recipe: r, isMine: true })),
    ...friendRecipes.map((f) => ({ recipe: f.recipe, isMine: false, friendEmail: f.friendEmail, friendId: f.friendId })),
  ];

  const filtered = allRecipes.filter(({ recipe }) => {
    const q = search.toLowerCase().trim();
    const matchTab =
      tab === "all" ? true : recipe.status === tab;
    const matchSearch =
      !q ||
      recipe.name.toLowerCase().includes(q) ||
      recipe.ingredients?.some((i) => i.name.toLowerCase().includes(q));
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
          <Link to="/?tab=all" className={`tab-item ${tab === "all" ? "active" : ""}`}>All</Link>
          <Link to="/?tab=keeper" className={`tab-item ${tab === "keeper" ? "active" : ""}`}>Keepers</Link>
          <Link to="/?tab=want_to_try" className={`tab-item ${tab === "want_to_try" ? "active" : ""}`}>Save for Later</Link>
        </div>

        {/* Search label */}
        {search && (
          <div style={{ fontSize: 13, color: "var(--gray)", fontWeight: 600, marginBottom: 14 }}>
            Results for: <span style={{ color: "var(--green-dark)", fontWeight: 800 }}>"{search}"</span>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: "center", color: "var(--gray)", padding: "48px 0" }}>Loading recipes...</div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🍳</div>
            <div className="empty-title">No recipes found</div>
            <div className="empty-sub">Try a different search or add a new recipe.</div>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(({ recipe: r, isMine, friendEmail, friendId }, i) => (
              <Link
                key={`${isMine ? "mine" : friendId}-${r._id}`}
                to={isMine ? `/recipe/${r._id}` : `/friends/${friendId}/recipes/${r._id}`}
                className="recipe-pill"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="recipe-pill-left">
                  <div>
                    <div className="recipe-pill-name">{r.name}</div>
                    <div className="recipe-pill-meta">
                      {r.servings ? `👥 ${r.servings} servings` : ""}
                      {r.servings && r.ingredients?.length ? " · " : ""}
                      {r.ingredients?.length ? `🥘 ${r.ingredients.length} ingredients` : ""}
                      {!isMine && (
                        <span style={{
                          marginLeft: 6,
                          background: "#f0f4ff",
                          color: "#3b6fd4",
                          border: "1px solid #a0b8f0",
                          borderRadius: 50,
                          fontSize: 10, fontWeight: 800,
                          padding: "1px 8px",
                        }}>
                          👁 {friendEmail}
                        </span>
                      )}
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
