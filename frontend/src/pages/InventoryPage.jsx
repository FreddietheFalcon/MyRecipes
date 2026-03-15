import { useEffect, useState } from "react";
import { Link } from "react-router";
import Sidebar from "../components/Sidebar";
import api from "../lib/axios";
import toast from "react-hot-toast";

const STATUS_LABEL = { ok: "✅ In Stock", low: "⚠️ Low", out: "❌ Out" };
const STATUS_STYLE = {
  ok:  { background: "var(--green-light)", color: "var(--green-dark)" },
  low: { background: "var(--orange-light)", color: "var(--orange)" },
  out: { background: "#fff0f0", color: "var(--red)" },
};

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await api.get("/inventory");
        setInventory(res.data);
      } catch {
        toast.error("Failed to load inventory");
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this ingredient?")) return;
    try {
      await api.delete(`/inventory/${id}`);
      setInventory((prev) => prev.filter((i) => i._id !== id));
      toast.success("Ingredient removed");
    } catch { toast.error("Failed to remove"); }
  };

  const filtered = inventory.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    ok:  inventory.filter((i) => i.status === "ok").length,
    low: inventory.filter((i) => i.status === "low").length,
    out: inventory.filter((i) => i.status === "out").length,
  };

  return (
    <div className="shell">
      <Sidebar />
      <main className="main-card">

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 12 }}>
          <h1 className="page-title">🥫 Ingredient Inventory</h1>
          <Link to="/inventory/add" className="btn-primary">+ Add Ingredient</Link>
        </div>
        <p style={{ fontSize: 13, color: "var(--gray)", fontWeight: 600, marginBottom: 24 }}>
          Track what you have on hand so you always know what you can cook.
        </p>

        {/* Summary chips */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { icon: "✅", val: counts.ok,  label: "In Stock",      color: "var(--green-dark)" },
            { icon: "⚠️", val: counts.low, label: "Running Low",   color: "var(--orange)" },
            { icon: "❌", val: counts.out, label: "Out of Stock",  color: "var(--red)" },
            { icon: "📦", val: inventory.length, label: "Total Items", color: "var(--text)" },
          ].map((chip) => (
            <div key={chip.label} style={{ flex: 1, minWidth: 110, display: "flex", alignItems: "center", gap: 10, background: "var(--white)", border: "1.5px solid var(--gray-mid)", borderRadius: 14, padding: "10px 18px" }}>
              <span style={{ fontSize: 20 }}>{chip.icon}</span>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: chip.color, lineHeight: 1 }}>{chip.val}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray)", textTransform: "uppercase", letterSpacing: ".04em" }}>{chip.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="search-wrap" style={{ marginBottom: 24 }}>
          <span style={{ color: "var(--gray)", fontSize: 16 }}>🔍</span>
          <input type="text" placeholder="Search ingredients…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: "center", color: "var(--gray)", padding: "48px 0" }}>Loading...</div>
        ) : (
          <div style={{ border: "1.5px solid var(--gray-mid)", borderRadius: 16, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--gray-light)", borderBottom: "2px solid var(--gray-mid)" }}>
                  {["Ingredient", "Amount", "Unit", "Status", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "12px 18px", textAlign: h === "Actions" ? "right" : "left", fontSize: 11, fontWeight: 800, color: "var(--gray)", textTransform: "uppercase", letterSpacing: ".07em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: "48px 20px", color: "var(--gray)", fontSize: 14, fontWeight: 600 }}>No ingredients found.</td></tr>
                ) : filtered.map((item) => (
                  <tr key={item._id} style={{ borderBottom: "1.5px solid #f3f5f7" }}>
                    <td style={{ padding: "13px 18px", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{item.name}</td>
                    <td style={{ padding: "13px 18px", fontSize: 14, fontWeight: 700 }}>{item.amount}</td>
                    <td style={{ padding: "13px 18px", fontSize: 13, color: "var(--gray)" }}>{item.unit}</td>
                    <td style={{ padding: "13px 18px" }}>
                      <span style={{ ...STATUS_STYLE[item.status], display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 50, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em" }}>
                        {STATUS_LABEL[item.status]}
                      </span>
                    </td>
                    <td style={{ padding: "13px 18px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <Link to={`/inventory/edit/${item._id}`} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--green-light)", color: "var(--green-dark)", border: "1.5px solid var(--green)", borderRadius: 50, padding: "6px 14px", fontSize: 12, fontWeight: 800, textDecoration: "none" }}>
                          ✏️ Edit
                        </Link>
                        <button onClick={() => handleDelete(item._id)} style={{ width: 30, height: 30, borderRadius: "50%", border: "1.5px solid #ffdcdd", background: "#fff5f5", color: "var(--red)", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default InventoryPage;
