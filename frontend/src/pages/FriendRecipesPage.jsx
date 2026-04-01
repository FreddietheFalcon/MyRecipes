import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import Sidebar from "../components/Sidebar";
import api from "../lib/axios";
import toast from "react-hot-toast";

const FriendRecipesPage = () => {
  const { friendId } = useParams();
  const [friend, setFriend] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/friends/${friendId}/recipes`);
        setFriend(res.data.friend);
        setRecipes(res.data.recipes);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load recipes");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [friendId]);

  const filtered = recipes.filter((r) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      r.ingredients?.some((i) => i.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="shell">
      <Sidebar />
      <main className="main-card">

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <Link to="/friends" className="btn-back">‹</Link>
          <div>
            <h1 className="page-title">{friend ? `${friend.email}'s Recipes` : "Friend's Recipes"}</h1>
            <p style={{ fontSize: 13, color: "var(--gray)", fontWeight: 600, marginTop: 4 }}>
              Browsing as a Viewer — read only
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "var(--gray)", padding: "48px 0" }}>Loading...</div>
        ) : (
          <>
            {/* Search */}
            <div className="search-wrap" style={{ marginBottom: 24, marginTop: 20 }}>
              <span style={{ color: "var(--gray)", fontSize: 17 }}>🔍</span>
              <input
                type="text"
                placeholder="Search recipes or ingredients"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🍳</div>
                <div className="empty-title">No recipes found</div>
                <div className="empty-sub">
                  {recipes.length === 0 ? "This friend hasn't added any recipes yet." : "Try a different search."}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {filtered.map((r) => (
                  <div key={r._id} className="recipe-pill" style={{ cursor: "default" }}>
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default FriendRecipesPage;
