import { useState } from "react";
import { Link, useNavigate } from "react-router";
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
  { value: "ok",  icon: "✅", label: "In Stock",     sub: "Enough on hand",       cls: "opt-ok" },
  { value: "low", icon: "⚠️", label: "Running Low",  sub: "Need to restock soon", cls: "opt-low" },
  { value: "out", icon: "❌", label: "Out of Stock", sub: "Need to buy",           cls: "opt-out" },
];

const STATUS_COLORS = {
  ok:  { background: "var(--green-light)",  color: "var(--green-dark)", border: "var(--green)" },
  low: { background: "var(--orange-light)", color: "var(--orange)",     border: "var(--orange)" },
  out: { background: "#fff0f0",             color: "var(--red)",        border: "var(--red)" },
};

const BADGE_LABEL = { ok: "✅ In Stock", low: "⚠️ Running Low", out: "❌ Out of Stock" };

// ── Validation ────────────────────────────────────────────────────────────────
const SAFE_TEXT_REGEX = /^[a-zA-Z0-9\u00C0-\u024F\s'"!?.,\-_()\&@#%+=*/~]+$/;

function validateName(text, fieldName = "Name") {
  if (!text?.trim()) return `${fieldName} cannot be empty`;
  if (text.length > 100) return `${fieldName} must be 100 characters or less`;
  if (!SAFE_TEXT_REGEX.test(text)) return `${fieldName} contains invalid characters (< > { } [ ] are not allowed)`;
  return null;
}

// ── Component ─────────────────────────────────────────────────────────────────
const AddIngredientPage = () => {
  const [name, setName]     = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit]     = useState("");
  const [status, setStatus] = useState("ok");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nameError = validateName(name, "Ingredient name");
    if (nameError) { toast.error(nameError); return; }

    setLoading(true);
    try {
      await api.post("/inventory", { name, amount: amount ? Number(amount) : 0, unit, status });
      toast.success(`"${name}" added to inventory!`);
      navigate("/inventory");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add ingredient");
    } finally {
      setLoading(false);
    }
  };

  const sc = STATUS_COLORS[status];

  return (
    <div className="shell">
      <Sidebar />
      <main className="main-card">

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
          <Link to="/inventory" className="btn-back">‹</Link>
          <h1 className="page-title">Add Ingredient</h1>
        </div>

        <form onSubmit={handleSubmit} style={{ maxWidth: 560 }}>

          {/* Name */}
          <div className="field">
            <label className="field-label">Ingredient Name</label>
            <div className="input-wrap">
              <input type="text" placeholder="e.g. Garlic" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          </div>

          {/* Amount + Unit */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 20 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field-label">Amount</label>
              <div className="input-wrap">
                <span style={{ color: "var(--gray)" }}>🔢</span>
                <input type="number" placeholder="e.g. 4" value={amount} onChange={(e) => setAmount(e.target.value)} min="0" step="0.25" />
              </div>
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field-label">Unit of Measurement</label>
              <div className="input-wrap">
                <span style={{ color: "var(--gray)" }}>📏</span>
                <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                  <option value="" disabled>Select unit…</option>
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
                  <label key={opt.value} onClick={() => setStatus(opt.value)}
                    style={{ flex: 1, minWidth: 100, display: "flex", alignItems: "center", gap: 8, border: `2px solid ${selected ? c.border : "var(--gray-mid)"}`, borderRadius: 14, padding: "12px 16px", cursor: "pointer", background: selected ? c.background : "var(--white)", transition: "all .2s" }}>
                    <input type="radio" name="status" value={opt.value} checked={selected} onChange={() => setStatus(opt.value)} style={{ display: "none" }} />
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
                <div style={{ fontSize: 15, fontWeight: 800, color: name ? "var(--text)" : "var(--gray)", fontStyle: name ? "normal" : "italic" }}>
                  {name || "Enter ingredient name…"}
                </div>
                <div style={{ fontSize: 13, color: "var(--gray)", fontWeight: 600 }}>
                  {amount || "—"} {unit || "unit not selected"}
                </div>
              </div>
              <span style={{ ...sc, fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 50, textTransform: "uppercase", letterSpacing: ".04em" }}>
                {BADGE_LABEL[status]}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 14 }}>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, justifyContent: "center", padding: "15px 24px", fontSize: 15 }}>
              {loading ? "Adding..." : "+ Add to Inventory"}
            </button>
            <Link to="/inventory" className="btn-ghost" style={{ flex: 1, justifyContent: "center", padding: "13px 24px", fontSize: 15 }}>
              Cancel
            </Link>
          </div>

        </form>
      </main>
    </div>
  );
};

export default AddIngredientPage;
