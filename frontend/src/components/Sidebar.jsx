import { Link, useLocation } from "react-router";

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { label: "Search",        path: "/",           exact: true },
    { label: "Keepers",       path: "/?tab=keeper" },
    { label: "Save for Later",path: "/?tab=want_to_try" },
    { label: "Add Recipe",    path: "/create" },
    { label: "Inventory",     path: "/inventory" },
  ];

  const isActive = (path, exact) => {
    if (exact) return location.pathname === "/" && !location.search;
    if (path.startsWith("/?")) return location.pathname === "/" && location.search === path.slice(1);
    return location.pathname === path;
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo-circle">R</div>
        <span className="brand-name">My Recipes</span>
      </div>

      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`nav-item ${isActive(item.path, item.exact) ? "active" : ""}`}
        >
          {item.label}
        </Link>
      ))}

      <button className="nav-item logout-btn" style={{ background: "none", border: "none", textAlign: "left", cursor: "pointer", marginTop: "auto" }}>
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
