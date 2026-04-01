import { useState, useEffect } from "react";
import { Link } from "react-router";
import Sidebar from "../components/Sidebar";
import api from "../lib/axios";
import toast from "react-hot-toast";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/auth/users");
        setUsers(res.data);
      } catch {
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      const res = await api.put(`/auth/users/${userId}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role: res.data.role } : u));
      toast.success(`Role updated to ${newRole}`);
    } catch {
      toast.error("Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  const ROLE_COLORS = {
    owner:  { background: "#e8f9d0", color: "#5aaa10", border: "#7ed321" },
    viewer: { background: "#f0f4ff", color: "#3b6fd4", border: "#a0b8f0" },
  };

  return (
    <div className="shell">
      <Sidebar />
      <main className="main-card">

        {/* Header */}
        <div style={{ marginBottom: 8 }}>
          <h1 className="page-title">👥 Manage Users</h1>
        </div>
        <p style={{ fontSize: 13, color: "var(--gray)", fontWeight: 600, marginBottom: 28 }}>
          View all registered users and manage their roles. Owners have full access, Viewers can only read recipes.
        </p>

        {loading ? (
          <div style={{ textAlign: "center", color: "var(--gray)", padding: "48px 0" }}>Loading...</div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--gray)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
            <p style={{ fontWeight: 700 }}>No users found</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {users.map((user) => {
              const rc = ROLE_COLORS[user.role];
              const isUpdating = updatingId === user._id;
              return (
                <div key={user._id} style={{
                  border: "1.5px solid var(--gray-mid)",
                  borderRadius: 16,
                  padding: "18px 22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  flexWrap: "wrap",
                  background: "var(--white)",
                }}>
                  {/* Left: user info */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>
                      {user.email}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--gray)", fontWeight: 600 }}>
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                      {" · "}
                      {user.isVerified ? "✅ Verified" : "⚠️ Not verified"}
                    </div>
                  </div>

                  {/* Middle: current role badge */}
                  <span style={{
                    ...rc,
                    fontSize: 11, fontWeight: 800,
                    padding: "4px 14px", borderRadius: 50,
                    textTransform: "uppercase", letterSpacing: ".04em",
                    border: `1.5px solid ${rc.border}`,
                    flexShrink: 0,
                  }}>
                    {user.role}
                  </span>

                  {/* Right: role toggle buttons */}
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button
                      disabled={user.role === "owner" || isUpdating}
                      onClick={() => handleRoleChange(user._id, "owner")}
                      style={{
                        padding: "8px 16px", borderRadius: 50, fontSize: 12, fontWeight: 800,
                        fontFamily: "'Nunito', sans-serif", cursor: user.role === "owner" ? "default" : "pointer",
                        background: user.role === "owner" ? "#e8f9d0" : "transparent",
                        color: user.role === "owner" ? "#5aaa10" : "var(--gray)",
                        border: `1.5px solid ${user.role === "owner" ? "#7ed321" : "var(--gray-mid)"}`,
                        opacity: isUpdating ? 0.6 : 1,
                        transition: "all .2s",
                      }}
                    >
                      ⭐ Owner
                    </button>
                    <button
                      disabled={user.role === "viewer" || isUpdating}
                      onClick={() => handleRoleChange(user._id, "viewer")}
                      style={{
                        padding: "8px 16px", borderRadius: 50, fontSize: 12, fontWeight: 800,
                        fontFamily: "'Nunito', sans-serif", cursor: user.role === "viewer" ? "default" : "pointer",
                        background: user.role === "viewer" ? "#f0f4ff" : "transparent",
                        color: user.role === "viewer" ? "#3b6fd4" : "var(--gray)",
                        border: `1.5px solid ${user.role === "viewer" ? "#a0b8f0" : "var(--gray-mid)"}`,
                        opacity: isUpdating ? 0.6 : 1,
                        transition: "all .2s",
                      }}
                    >
                      👁 Viewer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default UsersPage;
