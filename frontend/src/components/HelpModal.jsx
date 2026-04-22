import { useState } from "react";

const sections = [
  { id: "register",     title: "Creating an Account" },
  { id: "login",        title: "Logging In" },
  { id: "forgot",       title: "Forgot Password?" },
  { id: "troubleshoot", title: "Troubleshooting" },
];

const Steps = ({ items }) => (
  <ol style={{ paddingLeft: 0, listStyle: "none", margin: "8px 0" }}>
    {items.map((item, i) => (
      <li key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
        <span style={{
          minWidth: 22, height: 22, borderRadius: "50%",
          background: "#7ed321", color: "#fff",
          fontSize: 11, fontWeight: 800,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginTop: 1,
        }}>{i + 1}</span>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#2c3e50", lineHeight: 1.6, margin: 0 }}
          dangerouslySetInnerHTML={{ __html: item }} />
      </li>
    ))}
  </ol>
);

const Note = ({ children }) => (
  <div style={{
    background: "#fffdf0", border: "1px solid #f0e060",
    borderLeft: "3px solid #e0b000", borderRadius: 8,
    padding: "8px 12px", margin: "8px 0",
    fontSize: 12, fontWeight: 600, color: "#7a6000", lineHeight: 1.5,
  }}>
    📝 {children}
  </div>
);

const SectionBlock = ({ id, title, children }) => (
  <div id={id} style={{ marginBottom: 24 }}>
    <h3 style={{
      fontSize: 14, fontWeight: 800, color: "#5aaa10",
      borderBottom: "1.5px solid #e8f9d0", paddingBottom: 6, marginBottom: 12,
      fontFamily: "'Nunito', sans-serif",
    }}>{title}</h3>
    {children}
  </div>
);

// ── The modal trigger + overlay ───────────────────────────────────────────────
const HelpModal = () => {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("register");

  return (
    <>
      {/* Trigger link */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        type="button"
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#b0b8c1", fontWeight: 700, fontSize: 13,
          fontFamily: "'Nunito', sans-serif", padding: 0,
          textDecoration: "none",
        }}
      >
        ❓ Help
      </button>

      {/* Overlay */}
      {open && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24,
        }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div style={{
            background: "#fff", borderRadius: 20,
            width: "100%", maxWidth: 720, maxHeight: "85vh",
            display: "flex", flexDirection: "column",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            overflow: "hidden",
          }}>
            {/* Modal header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "18px 24px",
              borderBottom: "1.5px solid #e4e9ef",
              background: "#f8fdf2",
            }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#5aaa10", fontFamily: "'Nunito', sans-serif" }}>
                🍳 My Recipes — Help
              </h2>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "#f0f4f0", border: "none", borderRadius: "50%",
                  width: 32, height: 32, cursor: "pointer",
                  fontSize: 16, color: "#666", fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >✕</button>
            </div>

            {/* Modal body */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
              {/* Nav */}
              <nav style={{
                width: 180, flexShrink: 0, padding: "16px 12px",
                borderRight: "1.5px solid #e4e9ef",
                background: "#fafafa",
              }}>
                {sections.map((s) => (
                  <button key={s.id}
                    onClick={() => {
                      setActiveSection(s.id);
                      document.getElementById("help-content-" + s.id)?.scrollIntoView({ behavior: "smooth" });
                    }}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "7px 10px", marginBottom: 2, borderRadius: 8,
                      background: activeSection === s.id ? "#e8f9d0" : "transparent",
                      color: activeSection === s.id ? "#5aaa10" : "#888",
                      border: activeSection === s.id ? "1px solid #7ed321" : "1px solid transparent",
                      fontSize: 12, fontWeight: activeSection === s.id ? 800 : 600,
                      fontFamily: "'Nunito', sans-serif", cursor: "pointer",
                    }}
                  >{s.title}</button>
                ))}

              </nav>

              {/* Content */}
              <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto" }}>

                <div id="help-content-register">
                  <SectionBlock title="Creating an Account">
                    <Steps items={[
                      'On the Login page, click the green <strong>Register</strong> link.',
                      'Enter your email address.',
                      'Create a password that meets all the complexity requirements shown.',
                      'Re-enter the password in the Confirm Password field.',
                      'Click <strong>Create Account</strong>.',
                      'Check your email for a 6-digit code and enter it to verify your account.',
                    ]} />
                    <Note>The verification code expires in 10 minutes. Check your spam folder if you don't see it.</Note>
                    <div style={{ marginTop: 10, padding: "10px 12px", background: "#f8fdf2", border: "1px solid #e0f0c0", borderRadius: 8 }}>
                      <p style={{ fontSize: 12, fontWeight: 800, color: "#5aaa10", margin: "0 0 6px" }}>Password must include:</p>
                      {["At least 8 characters", "One uppercase letter (A-Z)", "One lowercase letter (a-z)", "One number (0-9)", "One special character (!@#$...)"].map((r) => (
                        <div key={r} style={{ fontSize: 12, fontWeight: 600, color: "#2c3e50", marginBottom: 3 }}>○ {r}</div>
                      ))}
                    </div>
                  </SectionBlock>
                </div>

                <div id="help-content-login">
                  <SectionBlock title="Logging In">
                    <Steps items={[
                      'Enter your email address and password.',
                      'Click <strong>Sign In</strong>.',
                      'Check your email for a 6-digit login code.',
                      'Enter the code and click <strong>Verify Code</strong>.',
                    ]} />
                    <Note>My Recipes uses two-factor authentication (2FA) for security. A code is sent to your email every time you log in.</Note>
                  </SectionBlock>
                </div>

                <div id="help-content-forgot">
                  <SectionBlock title="Forgot Password?">
                    <Steps items={[
                      'Click <strong>Forgot password?</strong> below the Sign In button.',
                      'Enter your registered email address.',
                      'Click <strong>Send Reset Code</strong>.',
                      'Check your email for a 6-digit reset code and enter it.',
                      'Create a new password and click <strong>Reset Password</strong>.',
                      'You will be redirected to the Login page.',
                    ]} />
                  </SectionBlock>
                </div>

                <div id="help-content-troubleshoot">
                  <SectionBlock title="Troubleshooting">
                    {[
                      ["I didn't receive a verification or login code", "Check your spam or junk folder. Codes expire in 10 minutes — go back and request a new one."],
                      ["I see a red error message on the login page", "Read the error — it will tell you what went wrong. Use Forgot password? if you can't remember your password."],
                      ["My password was rejected during registration", "Make sure it has uppercase, lowercase, a number, and a special character (like ! or @)."],
                      ["The app is slow to load", "The server may be starting up — wait 30 seconds and refresh the page (press F5)."],
                    ].map(([problem, solution]) => (
                      <div key={problem} style={{ marginBottom: 12, padding: "10px 12px", background: "#f8f9fa", borderRadius: 8, border: "1px solid #e4e9ef" }}>
                        <p style={{ fontSize: 13, fontWeight: 800, color: "#2c3e50", margin: "0 0 4px" }}>❓ {problem}</p>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "#666", margin: 0, lineHeight: 1.5 }}>{solution}</p>
                      </div>
                    ))}
                  </SectionBlock>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpModal;
