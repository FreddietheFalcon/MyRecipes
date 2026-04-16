import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import toast, { Toaster } from "react-hot-toast";
import api from "../lib/axios";

const LoginPage = () => {
  const [step, setStep] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const errorRef = useRef(null);
  const navigate = useNavigate();

  // Scroll error into view whenever it changes
  useEffect(() => {
    if (errorMsg && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [errorMsg]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/login", { email, password });
      setErrorMsg("");
      setStep("otp");
      toast.success("Check your email for a login code!");
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/verify-otp", { email, otp });
      // Use full page reload so App.jsx re-checks auth status from scratch
      window.location.href = "/";
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = {
    fontSize: 12, fontWeight: 800, color: "#2c3e50",
    textTransform: "uppercase", letterSpacing: ".05em",
    display: "block", marginBottom: 6,
  };

  const inputStyle = (highlight) => ({
    width: "100%", padding: "11px 14px",
    border: `1.5px solid ${highlight ? "#e5333a" : "#e4e9ef"}`,
    borderRadius: 10, fontSize: 14,
    fontFamily: "'Nunito', sans-serif",
    outline: "none", boxSizing: "border-box",
    background: highlight ? "#fff8f8" : "#fff",
  });

  return (
    <div style={{
      minHeight: "100vh", background: "#f5f5f5",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Nunito', sans-serif", padding: "24px",
    }}>
      <Toaster position="top-center" toastOptions={{ error: { duration: 8000 } }} />
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
          <form onSubmit={handleLogin} autoComplete="off">
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@email.com"
                autoComplete="username"
                style={inputStyle(!!errorMsg)}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="current-password"
                style={inputStyle(!!errorMsg)}
              />
            </div>

            {/* Persistent error box */}
            <div ref={errorRef} style={{
              overflow: "hidden",
              maxHeight: errorMsg ? "80px" : "0px",
              opacity: errorMsg ? 1 : 0,
              transition: "max-height 0.3s ease, opacity 0.3s ease",
              marginBottom: errorMsg ? 16 : 0,
            }}>
              <div style={{
                background: "#fff0f0",
                border: "1.5px solid #e5333a",
                borderRadius: 10,
                padding: "12px 16px",
                fontSize: 14, fontWeight: 700, color: "#e5333a",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                ⚠️ {errorMsg}
              </div>
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
            <p style={{ textAlign: "center", marginTop: 8, fontSize: 13, color: "#b0b8c1", fontWeight: 600 }}>
              <Link to="/forgot-password" style={{ color: "#b0b8c1", fontWeight: 700, textDecoration: "none" }}>Forgot password?</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <p style={{ fontSize: 13, color: "#b0b8c1", fontWeight: 600, marginBottom: 20, textAlign: "center" }}>
              Sent to <strong style={{ color: "#2c3e50" }}>{email}</strong>
            </p>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="000000"
                maxLength={6}
                style={{ ...inputStyle(!!errorMsg), fontSize: 28, fontWeight: 800, letterSpacing: 12, textAlign: "center" }}
              />
            </div>

            <div ref={errorRef} style={{
              overflow: "hidden",
              maxHeight: errorMsg ? "80px" : "0px",
              opacity: errorMsg ? 1 : 0,
              transition: "max-height 0.3s ease, opacity 0.3s ease",
              marginBottom: errorMsg ? 16 : 0,
            }}>
              <div style={{
                background: "#fff0f0",
                border: "1.5px solid #e5333a",
                borderRadius: 10,
                padding: "12px 16px",
                fontSize: 14, fontWeight: 700, color: "#e5333a",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                ⚠️ {errorMsg}
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "13px", background: "#7ed321", color: "#fff",
              border: "none", borderRadius: 50, fontSize: 15, fontWeight: 800,
              fontFamily: "'Nunito', sans-serif", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, boxShadow: "0 3px 12px rgba(126,211,33,.35)",
            }}>
              {loading ? "Verifying..." : "Verify Code"}
            </button>
            <button type="button" onClick={() => { setStep("login"); setErrorMsg(""); }}
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
