import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import api from "../lib/axios";
import toast from "react-hot-toast";

const NAV_ITEMS = [
  { label: "Search",         to: "/",              icon: "🔍" },
  { label: "Add Recipe",     to: "/create",        icon: "➕" },
  { label: "Inventory",      to: "/inventory",     icon: "🥫" },
  { label: "Recover Deleted",to: "/trash",         icon: "♻️" },
  { label: "Friends",        to: "/friends",       icon: "🤝" },
  { label: "Copy Requests",  to: "/copy-requests", icon: "📋" },
  { label: "Help",           to: "/help",          icon: "❓" },
];

const Sidebar = () => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const fullPath = pathname + search;
  const [pendingFriends, setPendingFriends] = useState(0);
  const [pendingCopies, setPendingCopies] = useState(0);
  const [userEmail, setUserEmail] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const [friendsRes, copyRes, meRes] = await Promise.all([
          api.get("/friends"),
          api.get("/share-requests/incoming"),
          api.get("/auth/me"),
        ]);
        setPendingFriends(
          friendsRes.data.filter((f) => f.status === "pending" && f.direction === "received").length
        );
        setPendingCopies(copyRes.data.length);
        setUserEmail(meRes.data.email);
      } catch { }
    };
    fetchBadges();
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const isActive = (to) => {
    if (to === "/") return pathname === "/" && !search.includes("tab=");
    if (to.includes("?")) return fullPath === to;
    return pathname === to || pathname.startsWith(to + "/");
  };

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } catch { }
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const totalBadge = pendingFriends + pendingCopies;

  const navLinkStyle = (active) => ({
    display: "flex", alignItems: "center", gap: "10px",
    padding: "10px 14px", borderRadius: "12px",
    fontSize: "14px", fontWeight: active ? 700 : 600,
    fontFamily: "'Nunito', sans-serif",
    textDecoration: "none",
    transition: "background .15s, color .15s",
    background: active ? "#e8f9d0" : "transparent",
    color: active ? "#5aaa10" : "#b0b8c1",
    border: active ? "1.5px solid #7ed321" : "1.5px solid transparent",
  });

  // ── Desktop sidebar ────────────────────────────────────────────────────────
  const desktopSidebar = (
    <aside style={{
      background: "#fff", border: "2.5px solid #7ed321",
      borderRadius: "22px", width: "220px", flexShrink: 0,
      padding: "32px 20px", display: "flex", flexDirection: "column",
      gap: "4px", boxShadow: "0 4px 24px rgba(126,211,33,0.13)",
      alignSelf: "flex-start", position: "sticky", top: "24px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
        <div style={{
          width: "42px", height: "42px", borderRadius: "50%", background: "#7ed321",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Pacifico', cursive", color: "#fff", fontSize: "15px",
          boxShadow: "0 3px 10px rgba(126,211,33,.35)", flexShrink: 0,
        }}>R</div>
        <span style={{ fontSize: "18px", fontWeight: 800, color: "#2c3e50", fontFamily: "'Nunito', sans-serif" }}>
          My Recipes
        </span>
      </div>

      {userEmail && (
        <div style={{
          fontSize: 11, fontWeight: 700, color: "var(--gray)",
          background: "var(--gray-light)", borderRadius: 8,
          padding: "6px 10px", marginBottom: 8,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }} title={userEmail}>👤 {userEmail}</div>
      )}

      {NAV_ITEMS.map(({ label, to, icon }) => {
        const active = isActive(to);
        const badge = label === "Friends" ? pendingFriends : label === "Copy Requests" ? pendingCopies : 0;
        return (
          <Link key={label} to={to} style={{ ...navLinkStyle(active), marginTop: label === "Recover Deleted" ? "8px" : "0" }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "#f4fce8"; e.currentTarget.style.color = "#5aaa10"; } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#b0b8c1"; } }}>
            <span style={{ fontSize: "17px", lineHeight: 1 }}>{icon}</span>
            <span style={{ flex: 1 }}>{label}</span>
            {badge > 0 && (
              <span style={{ background: "#e5333a", color: "#fff", borderRadius: 50, fontSize: 10, fontWeight: 800, padding: "2px 7px" }}>{badge}</span>
            )}
          </Link>
        );
      })}

      <div style={{ height: "1px", background: "#f0f4f0", margin: "12px 0" }} />
      <button onClick={handleLogout} style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "10px 14px", borderRadius: "12px", fontSize: "14px", fontWeight: 600,
        fontFamily: "'Nunito', sans-serif", color: "#b0b8c1",
        border: "1.5px solid transparent", background: "transparent", cursor: "pointer", width: "100%",
      }}
        onMouseEnter={e => { e.currentTarget.style.background = "#fff0f0"; e.currentTarget.style.color = "#e5333a"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#b0b8c1"; }}>
        <span style={{ fontSize: "17px" }}>🚪</span>
        <span>Logout</span>
      </button>
    </aside>
  );

  // ── Mobile hamburger ───────────────────────────────────────────────────────
  const mobileNav = (
    <>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#fff", border: "2.5px solid #7ed321", borderRadius: 16,
        padding: "10px 16px", marginBottom: 12,
        boxShadow: "0 4px 24px rgba(126,211,33,0.13)",
        position: "sticky", top: 12, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%", background: "#7ed321",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Pacifico', cursive", color: "#fff", fontSize: 13,
          }}>R</div>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#2c3e50", fontFamily: "'Nunito', sans-serif" }}>My Recipes</span>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{
          background: "none", border: "none", cursor: "pointer",
          padding: "4px 8px", fontSize: 22, color: "#5aaa10",
          display: "flex", flexDirection: "column", gap: 5, alignItems: "center", justifyContent: "center",
          position: "relative",
        }}>
          <div style={{ width: 24, height: 2, background: menuOpen ? "#e5333a" : "#5aaa10", borderRadius: 2, transition: "all .2s",
            transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
          <div style={{ width: 24, height: 2, background: menuOpen ? "transparent" : "#5aaa10", borderRadius: 2, transition: "all .2s" }} />
          <div style={{ width: 24, height: 2, background: menuOpen ? "#e5333a" : "#5aaa10", borderRadius: 2, transition: "all .2s",
            transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
          {totalBadge > 0 && !menuOpen && (
            <span style={{
              position: "absolute", top: 0, right: 0,
              background: "#e5333a", color: "#fff",
              borderRadius: 50, fontSize: 9, fontWeight: 800,
              padding: "1px 5px", lineHeight: 1.4,
            }}>{totalBadge}</span>
          )}
        </button>
      </div>

      {/* Dropdown menu */}
      {menuOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 200,
          background: "rgba(0,0,0,0.4)",
        }} onClick={() => setMenuOpen(false)}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0,
            background: "#fff", borderRadius: "0 0 22px 22px",
            padding: "20px 16px 24px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            border: "2.5px solid #7ed321", borderTop: "none",
          }} onClick={e => e.stopPropagation()}>
            {userEmail && (
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray)", background: "var(--gray-light)", borderRadius: 8, padding: "6px 10px", marginBottom: 12 }}>
                👤 {userEmail}
              </div>
            )}
            {NAV_ITEMS.map(({ label, to, icon }) => {
              const active = isActive(to);
              const badge = label === "Friends" ? pendingFriends : label === "Copy Requests" ? pendingCopies : 0;
              return (
                <Link key={label} to={to} style={{ ...navLinkStyle(active), marginBottom: 4, display: "flex" }}>
                  <span style={{ fontSize: "17px", lineHeight: 1 }}>{icon}</span>
                  <span style={{ flex: 1 }}>{label}</span>
                  {badge > 0 && (
                    <span style={{ background: "#e5333a", color: "#fff", borderRadius: 50, fontSize: 10, fontWeight: 800, padding: "2px 7px" }}>{badge}</span>
                  )}
                </Link>
              );
            })}
            <div style={{ height: "1px", background: "#f0f4f0", margin: "12px 0" }} />
            <button onClick={handleLogout} style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 14px", borderRadius: "12px", fontSize: "14px", fontWeight: 600,
              fontFamily: "'Nunito', sans-serif", color: "#e5333a",
              border: "1.5px solid #ffdcdd", background: "#fff0f0", cursor: "pointer", width: "100%",
            }}>
              <span style={{ fontSize: "17px" }}>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </>
  );

  // ── Render based on screen width ───────────────────────────────────────────
  return (
    <>
      <style>{`
        .sidebar-desktop { display: flex; }
        .sidebar-mobile  { display: none; width: 100%; }
        @media (max-width: 640px) {
          .sidebar-desktop { display: none !important; }
          .sidebar-mobile  { display: block !important; }
        }
      `}</style>
      <div className="sidebar-desktop">{desktopSidebar}</div>
      <div className="sidebar-mobile">{mobileNav}</div>
    </>
  );
};

export default Sidebar;
