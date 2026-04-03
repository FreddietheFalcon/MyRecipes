import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import Sidebar from "../components/Sidebar";
import RateLimitedUI from "../components/RateLimitedUI";
import api from "../lib/axios";
import toast from "react-hot-toast";

const HomePage = () => {
  const [myRecipes, setMyRecipes] = useState([]);
  const [friendRecipes, setFriendRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "all";

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [myRes, friendsRes, myRequestsRes, meRes] = await Promise.all([
          api.get("/recipes"),
          api.get("/friends"),
          api.get("/share-requests/my"),
          api.get("/auth/me"),
        ]);

        const myUserId = meRes.data.id || meRes.data._id;
        setMyRecipes(myRes.data);

        // Build sets to filter out redundant friend recipes:
        // 1. Recipes I already requested and got approved (I have my own copy)
        const approvedOriginalIds = new Set(
          myRequestsRes.data
            .filter((r) => r.status === "approved")
            .map((r) => r.recipeId?.toString())
        );
        // 2. My own recipe IDs (don't show copies of my recipes from friends)
        const myRecipeIds = new Set(myRes.data.map((r) => r._id.toString()));

        const accepted = friendsRes.data.filter((f) => f.status === "accepted");

        const friendData = await Promise.all(
          accepted.map(async (f) => {
            try {
              const res = await api.get(`/friends/${f.friend._id}/recipes`);
              return res.data.recipes
                // Don't show recipes that YOU originally created
                .filter((r) => r.userId?.toString() !== myUserId?.toString())
                // Don't show recipes you already have an approved copy of
                .filter((r) => !approvedOriginalIds.has(r._id.toString()))
                // Don't show a copy of your own recipe that a friend made
                .filter((r) => !myRecipeIds.has(r._id.toString()) && r.copiedFromEmail !== meRes.data.email)
                .map((r) => ({
                  recipe: r,
                  friendEmail: f.friend.email,
                  friendId: f.friend._id.toString(),
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

  const allItems = [
    ...myRecipes.map((r) => ({ recipe: r, isMine: true })),
    ...friendRecipes.map((f) => ({ recipe: f.recipe, isMine: false, friendEmail: f.friendEmail, friendId: f.friendId })),
  ];

  const filtered = allItems.filter(({ recipe, isMine }) => {
    const q = search.toLowerCase().trim();
    const matchTab =
      tab === "all" ? true :
      tab === "keeper" ? (isMine && recipe.status === "keeper") :
      tab === "want_to_try" ? (isMine && recipe.status === "want_to_try") :
      true;
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
                          background: "#f0f4ff", color: "#3b6fd4",
                          border: "1px solid #a0b8f0",
                          borderRadius: 50, fontSize: 10, fontWeight: 800,
                          padding: "1px 8px",
                        }}>
                          {friendEmail}
                        </span>
                      )}
                      {isMine && r.copiedFromEmail && (
                        <span style={{
                          marginLeft: 6,
                          background: "#fff3e0", color: "#e67e22",
                          border: "1px solid #f0c080",
                          borderRadius: 50, fontSize: 10, fontWeight: 800,
                          padding: "1px 8px",
                        }}>
                          📋 from {r.copiedFromEmail}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="recipe-pill-right">
                  {isMine ? (
                    <span className={r.status === "keeper" ? "badge-keeper" : "badge-later"}>
                      {r.status === "keeper" ? "⭐ Keeper" : "🕐 Later"}
                    </span>
                  ) : (
                    <span style={{
                      background: "#f0f4ff", color: "#3b6fd4",
                      border: "1.5px solid #a0b8f0",
                      borderRadius: 50, fontSize: 11, fontWeight: 800,
                      padding: "3px 12px",
                    }}>
                      👁 View Only
                    </span>
                  )}
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
