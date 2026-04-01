import { Link, useLocation, useNavigate } from "react-router";
import api from "../lib/axios";
import toast from "react-hot-toast";

const NAV_ITEMS = [
  { label: "Search",         to: "/",              icon: "🔍" },
  { label: "Keepers",        to: "/?tab=keeper",   icon: "⭐" },
  { label: "Save for Later", to: "/?tab=want_to_try", icon: "🕐" },
  { label: "Add Recipe",     to: "/create",        icon: "➕" },
  { label: "Inventory",      to: "/inventory",     icon: "🥫" },
  { label: "Recover Deleted",to: "/trash",         icon: "♻️" },
];

const Sidebar = () => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const fullPath = pathname + search;

  const isActive = (to) => {
    if (to === "/") return pathname === "/" && !search.includes("tab=");
    if (to.includes("?")) return fullPath === to;
    return pathname === to || pathname.startsWith(to + "/");
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Even if the API call fails, clear local state and redirect
    }
    navigate("/login");
    toast.success("Logged out successfully");
  };

  return (
    <aside style={{
      background: "#fff",
      border: "2.5px solid #7ed321",
      borderRadius: "22px",
      width: "220px",
      flexShrink: 0,
      padding: "32px 20px",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
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
          flexShrink: 0,
        }}>R</div>
        <span style={{ fontSize: "18px", fontWeight: 800, color: "#2c3e50", fontFamily: "'Nunito', sans-serif" }}>
          My Recipes
        </span>
      </div>

      {/* Nav links */}
      {NAV_ITEMS.map(({ label, to, icon }) => {
        const active = isActive(to);
        return (
          <Link
            key={label}
            to={to}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: active ? 700 : 600,
              fontFamily: "'Nunito', sans-serif",
              textDecoration: "none",
              transition: "background .15s, color .15s",
              background: active ? "#e8f9d0" : "transparent",
              color: active ? "#5aaa10" : "#b0b8c1",
              border: active ? "1.5px solid #7ed321" : "1.5px solid transparent",
              marginTop: label === "Recover Deleted" ? "8px" : "0",
            }}
            onMouseEnter={e => {
              if (!active) {
                e.currentTarget.style.background = "#f4fce8";
                e.currentTarget.style.color = "#5aaa10";
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#b0b8c1";
              }
            }}
          >
            <span style={{ fontSize: "17px", lineHeight: 1 }}>{icon}</span>
            <span>{label}</span>
          </Link>
        );
      })}

      {/* Divider */}
      <div style={{ height: "1px", background: "#f0f4f0", margin: "12px 0" }} />

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "10px 14px", borderRadius: "12px",
          fontSize: "14px", fontWeight: 600,
          fontFamily: "'Nunito', sans-serif",
          textDecoration: "none",
          color: "#b0b8c1",
          border: "1.5px solid transparent",
          background: "transparent",
          cursor: "pointer",
          width: "100%",
          transition: "background .15s, color .15s",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "#fff0f0";
          e.currentTarget.style.color = "#e5333a";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#b0b8c1";
        }}
      >
        <span style={{ fontSize: "17px" }}>🚪</span>
        <span>Logout</span>
      </button>

    </aside>
  );
};

export default Sidebar;
