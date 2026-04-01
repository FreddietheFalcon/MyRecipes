import { useState } from "react";
import { useNavigate, Link } from "react-router";
import toast from "react-hot-toast";
import api from "../lib/axios";

const LoginPage = () => {
  const [step, setStep] = useState("login"); // "login" | "otp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/login", { email, password });
      setStep("otp");
      toast.success("Check your email for a login code!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/verify-otp", { email, otp });
      toast.success("Welcome back!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#f5f5f5",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Nunito', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Pacifico&display=swap" rel="stylesheet" />

      <div style={{
        background: "#fff", border: "2.5px solid #7ed321",
        borderRadius: 22, padding: "48px 40px",
        width: "100%", maxWidth: 420,
        boxShadow: "0 4px 24px rgba(126,211,33,0.13)",
      }}>
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            background: "#7ed321", margin: "0 auto 12px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Pacifico', cursive", color: "#fff", fontSize: 22,
            boxShadow: "0 3px 12px rgba(126,211,33,.35)",
          }}>R</div>
          <h1 style={{ fontFamily: "'Pacifico', cursive", fontSize: 26, color: "#5aaa10", margin: 0 }}>My Recipes</h1>
          <p style={{ fontSize: 13, color: "#b0b8c1", fontWeight: 600, marginTop: 6 }}>
            {step === "login" ? "Sign in to your account" : "Enter the code sent to your email"}
          </p>
        </div>

        {step === "login" ? (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#2c3e50", textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                placeholder="you@email.com"
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e4e9ef", borderRadius: 10, fontSize: 14, fontFamily: "'Nunito', sans-serif", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#2c3e50", textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                placeholder="••••••••"
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e4e9ef", borderRadius: 10, fontSize: 14, fontFamily: "'Nunito', sans-serif", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "13px", background: "#7ed321", color: "#fff",
              border: "none", borderRadius: 50, fontSize: 15, fontWeight: 800,
              fontFamily: "'Nunito', sans-serif", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, boxShadow: "0 3px 12px rgba(126,211,33,.35)",
            }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
            <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#b0b8c1", fontWeight: 600 }}>
              Don't have an account?{" "}
              <Link to="/register" style={{ color: "#5aaa10", fontWeight: 800, textDecoration: "none" }}>Register</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <p style={{ fontSize: 13, color: "#b0b8c1", fontWeight: 600, marginBottom: 20, textAlign: "center" }}>
              Sent to <strong style={{ color: "#2c3e50" }}>{email}</strong>
            </p>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#2c3e50", textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 6 }}>Verification Code</label>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required
                placeholder="000000" maxLength={6}
                style={{ width: "100%", padding: "14px", border: "1.5px solid #e4e9ef", borderRadius: 10, fontSize: 28, fontWeight: 800, letterSpacing: 12, textAlign: "center", fontFamily: "'Nunito', sans-serif", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "13px", background: "#7ed321", color: "#fff",
              border: "none", borderRadius: 50, fontSize: 15, fontWeight: 800,
              fontFamily: "'Nunito', sans-serif", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, boxShadow: "0 3px 12px rgba(126,211,33,.35)",
            }}>
              {loading ? "Verifying..." : "Verify Code"}
            </button>
            <button type="button" onClick={() => setStep("login")}
              style={{ width: "100%", marginTop: 10, padding: "10px", background: "transparent", border: "1.5px solid #e4e9ef", borderRadius: 50, fontSize: 13, fontWeight: 700, fontFamily: "'Nunito', sans-serif", cursor: "pointer", color: "#b0b8c1" }}>
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
