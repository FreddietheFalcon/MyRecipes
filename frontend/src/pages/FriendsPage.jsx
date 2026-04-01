import { useState, useEffect } from "react";
import { Link } from "react-router";
import Sidebar from "../components/Sidebar";
import api from "../lib/axios";
import toast from "react-hot-toast";

const FriendsPage = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const fetchFriends = async () => {
    try {
      const res = await api.get("/friends");
      setFriends(res.data);
    } catch {
      toast.error("Failed to load friends");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFriends(); }, []);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    try {
      await api.post("/friends/request", { email });
      toast.success(`Friend request sent to ${email}!`);
      setEmail("");
      fetchFriends();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await api.put(`/friends/${id}/accept`);
      toast.success("Friend request accepted!");
      fetchFriends();
    } catch {
      toast.error("Failed to accept request");
    }
  };

  const handleRemove = async (id, label) => {
    if (!window.confirm(`${label}?`)) return;
    try {
      await api.delete(`/friends/${id}`);
      toast.success("Done!");
      fetchFriends();
    } catch {
      toast.error("Failed");
    }
  };

  const pending  = friends.filter((f) => f.status === "pending");
  const accepted = friends.filter((f) => f.status === "accepted");

  return (
    <div className="shell">
      <Sidebar />
      <main className="main-card">

        {/* Header */}
        <h1 className="page-title" style={{ marginBottom: 8 }}>🤝 Friends</h1>
        <p style={{ fontSize: 13, color: "var(--gray)", fontWeight: 600, marginBottom: 28 }}>
          Connect with friends to browse each other's recipes.
        </p>

        {/* Send friend request */}
        <div style={{ background: "var(--gray-light)", border: "1.5px solid var(--gray-mid)", borderRadius: 16, padding: "20px 24px", marginBottom: 32 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", marginBottom: 12, textTransform: "uppercase", letterSpacing: ".05em" }}>
            Add a Friend
          </div>
          <form onSubmit={handleSendRequest} style={{ display: "flex", gap: 10 }}>
            <div className="input-wrap" style={{ flex: 1 }}>
              <input
                type="email"
                placeholder="Enter friend's email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={sending}>
              {sending ? "Sending..." : "Send Request"}
            </button>
          </form>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "var(--gray)", padding: "32px 0" }}>Loading...</div>
        ) : (
          <>
            {/* Pending requests */}
            {pending.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div className="section-heading">
                  Pending Requests
                  <span style={{ marginLeft: 8, background: "#e5333a", color: "#fff", borderRadius: 50, fontSize: 11, fontWeight: 800, padding: "2px 8px" }}>
                    {pending.length}
                  </span>
                </div>
                {pending.map((f) => (
                  <div key={f._id} style={{
                    border: "1.5px solid var(--gray-mid)", borderRadius: 14,
                    padding: "14px 18px", marginBottom: 10,
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                  }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{f.friend.email}</div>
                      <div style={{ fontSize: 12, color: "var(--gray)", fontWeight: 600, marginTop: 2 }}>
                        {f.direction === "sent" ? "📤 Request sent" : "📥 Wants to be your friend"}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {f.direction === "received" && (
                        <button onClick={() => handleAccept(f._id)} className="btn-primary" style={{ fontSize: 12, padding: "8px 16px" }}>
                          ✓ Accept
                        </button>
                      )}
                      <button
                        onClick={() => handleRemove(f._id, f.direction === "sent" ? "Cancel this request" : "Decline this request")}
                        className="btn-ghost"
                        style={{ fontSize: 12, padding: "6px 14px", color: "var(--red)", borderColor: "#ffdcdd" }}
                      >
                        {f.direction === "sent" ? "Cancel" : "Decline"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Accepted friends */}
            <div>
              <div className="section-heading">My Friends ({accepted.length})</div>
              {accepted.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0", color: "var(--gray)" }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>👋</div>
                  <p style={{ fontWeight: 700 }}>No friends yet</p>
                  <p style={{ fontSize: 13 }}>Send a request above to get started!</p>
                </div>
              ) : (
                accepted.map((f) => (
                  <div key={f._id} style={{
                    border: "1.5px solid var(--gray-mid)", borderRadius: 14,
                    padding: "14px 18px", marginBottom: 10,
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                  }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{f.friend.email}</div>
                      <div style={{ fontSize: 12, color: "var(--gray)", fontWeight: 600, marginTop: 2 }}>
                        ✅ Connected
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Link
                        to={`/friends/${f.friend._id}/recipes`}
                        className="btn-primary"
                        style={{ fontSize: 12, padding: "8px 16px", textDecoration: "none" }}
                      >
                        🍳 View Recipes
                      </Link>
                      <button
                        onClick={() => handleRemove(f._id, "Remove this friend")}
                        className="btn-ghost"
                        style={{ fontSize: 12, padding: "6px 14px", color: "var(--red)", borderColor: "#ffdcdd" }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default FriendsPage;
