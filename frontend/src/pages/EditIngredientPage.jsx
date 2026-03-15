import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import Sidebar from "../components/Sidebar";
import api from "../lib/axios";
import toast from "react-hot-toast";

const UNITS = {
  Volume: ["tsp", "tbsp", "cup", "fl oz", "pint", "quart", "gallon", "ml", "liter"],
  Weight: ["oz", "lb", "g", "kg"],
  Count:  ["pcs", "cloves", "slices", "bunch", "jar", "can", "bag", "box", "package"],
  Other:  ["pinch", "dash", "handful", "to taste"],
};

const STATUS_OPTIONS = [
  { value: "ok",  icon: "✅", label: "In Stock",     sub: "Enough on hand" },
  { value: "low", icon: "⚠️", label: "Running Low",  sub: "Need to restock soon" },
  { value: "out", icon: "❌", label: "Out of Stock", sub: "Need to buy" },
];

const STATUS_COLORS = {
  ok:  { background: "var(--green-light)",  color: "var(--green-dark)", border: "var(--green)" },
  low: { background: "var(--orange-light)", color: "var(--orange)",     border: "var(--orange)" },
  out: { background: "#fff0f0",             color: "var(--red)",        border: "var(--red)" },
};

const BADGE_LABEL = { ok: "✅ In Stock", low: "⚠️ Running Low", out: "❌ Out of Stock" };

const EditIngredientPage = () => {
  const [name, setName]     = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit]     = useState("");
  const [status, setStatus] = useState("ok");
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [changed, setChanged]   = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/inventory/${id}`);
        const d = res.data;
        setName(d.name);
        setAmount(d.amount ?? "");
        setUnit(d.unit ?? "");
        setStatus(d.status ?? "ok");
      } catch {
        toast.error("Failed to load ingredient");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const markChanged = () => setChanged(true);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      await api.put(`/inventory/${id}`, { name, amount: amount ? Number(amount) : 0, unit, status });
      toast.success(`"${name}" updated!`);
      navigate("/inventory");
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/inventory/${id}`);
      toast.success(`"${name}" removed from inventory`);
      navigate("/inventory");
    } catch {
      toast.error("Failed to remove ingredient");
    }
  };

  if (loading) {
    return (
      <div className="shell">
        <Sidebar />
        <main className="main-card" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ color: "var(--gray)" }}>Loading...</div>
        </main>
      </div>
    );
  }

  const sc = STATUS_COLORS[status];

  return (
    <div className="shell">
      <Sidebar />
      <main className="main-card">

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Link to="/inventory" className="btn-back">‹</Link>
            <h1 className="page-title">Edit Ingredient</h1>
          </div>
          <button onClick={() => setShowDeleteModal(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", color: "var(--red)", border: "2px solid #ffdcdd", borderRadius: 50, padding: "9px 18px", fontFamily: "'Nunito', sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "background .2s, border-color .2s" }}
            onMouseOver={(e) => { e.currentTarget.style.background = "#fff5f5"; e.currentTarget.style.borderColor = "var(--red)"; }}
            onMouseOut={(e)  => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#ffdcdd"; }}>
            🗑 Remove from Inventory
          </button>
        </div>

        {/* Unsaved changes banner */}
        {changed && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fffdf0", border: "1.5px solid #f0e060", borderRadius: 12, padding: "11px 18px", marginBottom: 24, fontSize: 13, fontWeight: 700, color: "#8a7a00" }}>
            ✏️ You have unsaved changes — don't forget to save!
          </div>
        )}

        <form onSubmit={handleSave} style={{ maxWidth: 560 }}>

          {/* Name */}
          <div className="field">
            <label className="field-label">Ingredient Name</label>
            <div className="input-wrap">
              <input type="text" value={name} onChange={(e) => { setName(e.target.value); markChanged(); }} required />
            </div>
          </div>

          {/* Amount + Unit */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 20 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field-label">Amount</label>
              <div className="input-wrap">
                <span style={{ color: "var(--gray)" }}>🔢</span>
                <input type="number" value={amount} onChange={(e) => { setAmount(e.target.value); markChanged(); }} min="0" step="0.25" />
              </div>
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field-label">Unit of Measurement</label>
              <div className="input-wrap">
                <span style={{ color: "var(--gray)" }}>📏</span>
                <select value={unit} onChange={(e) => { setUnit(e.target.value); markChanged(); }}>
                  <option value="">Select unit…</option>
                  {Object.entries(UNITS).map(([group, opts]) => (
                    <optgroup key={group} label={group}>
                      {opts.map((o) => <option key={o}>{o}</option>)}
                    </optgroup>
                  ))}
                </select>
                <span style={{ color: "var(--gray)", fontSize: 13, pointerEvents: "none" }}>▾</span>
              </div>
            </div>
          </div>

          {/* Stock Status */}
          <div className="field">
            <label className="field-label">Stock Status</label>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {STATUS_OPTIONS.map((opt) => {
                const selected = status === opt.value;
                const c = STATUS_COLORS[opt.value];
                return (
                  <label key={opt.value} onClick={() => { setStatus(opt.value); markChanged(); }}
                    style={{ flex: 1, minWidth: 100, display: "flex", alignItems: "center", gap: 8, border: `2px solid ${selected ? c.border : "var(--gray-mid)"}`, borderRadius: 14, padding: "12px 16px", cursor: "pointer", background: selected ? c.background : "var(--white)", transition: "all .2s" }}>
                    <input type="radio" name="status" value={opt.value} checked={selected} onChange={() => { setStatus(opt.value); markChanged(); }} style={{ display: "none" }} />
                    <span style={{ fontSize: 18 }}>{opt.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)" }}>{opt.label}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--gray)" }}>{opt.sub}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="section-divider" />

          {/* Preview */}
          <div className="field">
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--gray)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 10 }}>Preview</div>
            <div style={{ background: "var(--gray-light)", border: "1.5px solid var(--gray-mid)", borderRadius: 16, padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>{name || "—"}</div>
                <div style={{ fontSize: 13, color: "var(--gray)", fontWeight: 600 }}>{amount || "—"} {unit || "—"}</div>
              </div>
              <span style={{ ...sc, fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 50, textTransform: "uppercase", letterSpacing: ".04em" }}>
                {BADGE_LABEL[status]}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 14 }}>
            <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1, justifyContent: "center", padding: "15px 24px", fontSize: 15 }}>
              {saving ? "Saving..." : "✓ Save Changes"}
            </button>
            <Link to="/inventory" className="btn-ghost" style={{ flex: 1, justifyContent: "center", padding: "13px 24px", fontSize: 15 }}>
              Cancel
            </Link>
          </div>

        </form>

        {/* Delete confirmation modal */}
        {showDeleteModal && (
          <div onClick={() => setShowDeleteModal(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
            <div onClick={(e) => e.stopPropagation()}
              style={{ background: "var(--white)", borderRadius: "var(--radius)", padding: "36px 36px 28px", maxWidth: 400, width: "90%", boxShadow: "0 12px 48px rgba(0,0,0,.18)", textAlign: "center" }}>
              <div style={{ fontSize: 42, marginBottom: 12 }}>🗑️</div>
              <div style={{ fontFamily: "'Pacifico', cursive", fontSize: 22, color: "var(--text)", marginBottom: 8 }}>Remove Ingredient?</div>
              <div style={{ fontSize: 14, color: "var(--gray)", fontWeight: 600, marginBottom: 28 }}>
                This will permanently remove "{name}" from your inventory. This action cannot be undone.
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={handleDelete}
                  style={{ flex: 1, background: "var(--red)", color: "white", border: "none", borderRadius: 50, padding: 13, fontFamily: "'Nunito', sans-serif", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
                  Yes, Remove
                </button>
                <button onClick={() => setShowDeleteModal(false)}
                  style={{ flex: 1, background: "transparent", color: "var(--text)", border: "2.5px solid var(--gray-mid)", borderRadius: 50, padding: 11, fontFamily: "'Nunito', sans-serif", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default EditIngredientPage;
