import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";

const sections = [
  { id: "intro",        title: "1. Introduction" },
  { id: "register",     title: "2. Creating an Account" },
  { id: "login",        title: "3. Logging In" },
  { id: "navigate",     title: "4. Navigating the App" },
  { id: "recipes",      title: "5. Managing Recipes" },
  { id: "recover",      title: "6. Recovering Deleted Recipes" },
  { id: "inventory",    title: "7. Inventory" },
  { id: "friends",      title: "8. Friends & Sharing" },
  { id: "security",     title: "9. Account Security" },
  { id: "troubleshoot", title: "10. Troubleshooting" },
  { id: "quickref",     title: "11. Quick Reference" },
];

// ── Reusable components ───────────────────────────────────────────────────────

const Section = ({ id, title, children }) => (
  <section id={id} style={{ marginBottom: 48, scrollMarginTop: 24 }}>
    <h2 style={{
      fontFamily: "'Pacifico', cursive", fontSize: 22, color: "var(--green-dark)",
      borderBottom: "2px solid var(--green)", paddingBottom: 8, marginBottom: 20,
    }}>{title}</h2>
    {children}
  </section>
);

const SubSection = ({ title, children }) => (
  <div style={{ marginBottom: 28 }}>
    <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", marginBottom: 12, fontFamily: "'Nunito', sans-serif" }}>
      {title}
    </h3>
    {children}
  </div>
);

const Steps = ({ items }) => (
  <ol style={{ paddingLeft: 0, listStyle: "none", margin: 0 }}>
    {items.map((item, i) => (
      <li key={i} style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "flex-start" }}>
        <span style={{
          minWidth: 26, height: 26, borderRadius: "50%",
          background: "var(--green)", color: "#fff",
          fontSize: 12, fontWeight: 800, display: "flex",
          alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1,
        }}>{i + 1}</span>
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", lineHeight: 1.6, margin: 0 }}
          dangerouslySetInnerHTML={{ __html: item }} />
      </li>
    ))}
  </ol>
);

const Note = ({ children }) => (
  <div style={{
    background: "#fffdf0", border: "1.5px solid #f0e060",
    borderLeft: "4px solid #e0b000", borderRadius: 10,
    padding: "10px 14px", margin: "12px 0",
    fontSize: 13, fontWeight: 600, color: "#7a6000",
    lineHeight: 1.6,
  }}>
    📝 <strong>Note:</strong> {children}
  </div>
);

const Tip = ({ children }) => (
  <div style={{
    background: "var(--green-light)", border: "1.5px solid var(--green)",
    borderLeft: "4px solid var(--green-dark)", borderRadius: 10,
    padding: "10px 14px", margin: "12px 0",
    fontSize: 13, fontWeight: 600, color: "var(--green-dark)",
    lineHeight: 1.6,
  }}>
    💡 <strong>Tip:</strong> {children}
  </div>
);

const InfoTable = ({ headers, rows }) => (
  <div style={{ overflowX: "auto", margin: "12px 0" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} style={{
              background: "var(--green)", color: "#fff", padding: "8px 12px",
              textAlign: "left", fontWeight: 800, fontFamily: "'Nunito', sans-serif",
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "var(--gray-light)" }}>
            {row.map((cell, j) => (
              <td key={j} style={{
                padding: "8px 12px", borderBottom: "1px solid var(--gray-mid)",
                fontWeight: j === 0 ? 700 : 600, color: "var(--text)", lineHeight: 1.5,
              }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Screenshot = ({ src, alt, caption }) => (
  src ? (
    <figure style={{ margin: "16px 0", textAlign: "center" }}>
      <img src={src} alt={alt} style={{
        maxWidth: "100%", border: "1.5px solid var(--gray-mid)",
        borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      }} />
      {caption && <figcaption style={{ fontSize: 12, color: "var(--gray)", marginTop: 6, fontWeight: 600 }}>{caption}</figcaption>}
    </figure>
  ) : null
);

// ── Main Help Page ────────────────────────────────────────────────────────────

const HelpPage = () => {
  const [activeId, setActiveId] = useState("intro");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    import('../lib/axios').then(({ default: api }) => {
      api.get('/auth/me').then(() => setIsLoggedIn(true)).catch(() => setIsLoggedIn(false));
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    document.querySelectorAll("section[id]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="shell">
      {isLoggedIn && <Sidebar />}
      <main className="main-card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "row", gap: 0 }}>

        {/* Table of Contents */}
        <nav style={{
          width: 220, flexShrink: 0, padding: "24px 16px",
          borderRight: "1.5px solid var(--gray-mid)",
          position: "sticky", top: 0, height: "100vh", overflowY: "auto",
          background: "var(--gray-light)",
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--gray)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>
            Contents
          </div>
          {sections.map((s) => (
            <button key={s.id} onClick={() => scrollTo(s.id)} style={{
              display: "block", width: "100%", textAlign: "left",
              padding: "6px 10px", marginBottom: 2, borderRadius: 8,
              background: activeId === s.id ? "var(--green-light)" : "transparent",
              color: activeId === s.id ? "var(--green-dark)" : "var(--gray)",
              border: activeId === s.id ? "1px solid var(--green)" : "1px solid transparent",
              fontSize: 12, fontWeight: activeId === s.id ? 800 : 600,
              fontFamily: "'Nunito', sans-serif", cursor: "pointer",
              transition: "all .15s",
            }}>
              {s.title}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div ref={contentRef} style={{ flex: 1, padding: "32px 40px", overflowY: "auto", maxHeight: "100vh" }}>

          {/* Back to login when not logged in */}
          {!isLoggedIn && (
            <div style={{ marginBottom: 16 }}>
              <Link to="/login" style={{ fontSize: 13, fontWeight: 700, color: "var(--green-dark)", textDecoration: "none" }}>← Back to Login</Link>
            </div>
          )}

          {/* Header */}
          <div style={{ marginBottom: 40, paddingBottom: 24, borderBottom: "2px solid var(--gray-mid)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Link to="/login" style={{ fontSize: 13, fontWeight: 700, color: "var(--gray)", textDecoration: "none" }}>← Back to Login</Link>
              <Link to="/" style={{ fontSize: 13, fontWeight: 700, color: "var(--green-dark)", textDecoration: "none" }}>Go to App →</Link>
            </div>
            <h1 style={{ fontFamily: "'Pacifico', cursive", fontSize: 28, color: "var(--green-dark)", margin: 0 }}>
              🍳 My Recipes — Help Guide
            </h1>
            <p style={{ fontSize: 13, color: "var(--gray)", fontWeight: 600, marginTop: 8 }}>
              Everything you need to know about using My Recipes.
            </p>
          </div>

          {/* ── Section 1: Introduction ── */}
          <Section id="intro" title="1. Introduction">
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", lineHeight: 1.7, marginBottom: 16 }}>
              My Recipes is a personal recipe management web application that lets you store, organize, and share recipes with friends. No installation is required — it runs directly in your web browser.
            </p>
            <Screenshot src="/help/home-page.png" alt="My Recipes home page" caption="The My Recipes home page showing your recipe collection." />
            <SubSection title="What You Can Do">
              <ul style={{ paddingLeft: 20, fontSize: 14, fontWeight: 600, color: "var(--text)", lineHeight: 2 }}>
                <li>Create and manage your personal recipe collection</li>
                <li>Organize recipes as Keepers ⭐ or Save for Later 🕐</li>
                <li>Search recipes by name or ingredient</li>
                <li>Track your personal pantry inventory</li>
                <li>Connect with friends to view and copy their recipes</li>
                <li>Recover accidentally deleted recipes within 30 days</li>
              </ul>
            </SubSection>
            <Note>My Recipes works best on a desktop or laptop computer. The app may take up to 30 seconds to load if it has been inactive.</Note>
          </Section>

          {/* ── Section 2: Creating an Account ── */}
          <Section id="register" title="2. Creating an Account">
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", lineHeight: 1.7, marginBottom: 16 }}>
              You need a free account to use My Recipes. You will need access to a valid email address.
            </p>
            <Screenshot src="/help/register-page.png" alt="Registration page" caption="The registration page with password requirements checklist." />
            <Steps items={[
              'On the Login page, click the green <strong>Register</strong> link at the bottom of the form.',
              'Enter your email address in the Email field.',
              'Create a strong password. A checklist will appear as you type showing the requirements.',
              'Re-enter the same password in the Confirm Password field.',
              'Click <strong>Create Account</strong>. A 6-digit verification code will be sent to your email.',
              'Check your email inbox and enter the 6-digit code on the next screen. Click <strong>Verify Email</strong>.',
            ]} />
            <InfoTable
              headers={["Password Requirement", "Example"]}
              rows={[
                ["At least 8 characters", "MyRecipes1!"],
                ["One uppercase letter (A-Z)", "M in MyRecipes1!"],
                ["One lowercase letter (a-z)", "y in MyRecipes1!"],
                ["One number (0-9)", "1 in MyRecipes1!"],
                ["One special character (!@#$...)", "! in MyRecipes1!"],
              ]}
            />
            <Note>The verification code expires in 10 minutes. Check your spam folder if you don't see it.</Note>
          </Section>

          {/* ── Section 3: Logging In ── */}
          <Section id="login" title="3. Logging In">
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", lineHeight: 1.7, marginBottom: 16 }}>
              My Recipes uses two-factor authentication (2FA) for security. Every login requires your password plus a one-time code sent to your email.
            </p>
            <Screenshot src="/help/login-page.png" alt="Login page" caption="The login page." />
            <Steps items={[
              'Go to <strong>https://myrecipes-yrhn.onrender.com</strong>. The Login page will appear.',
              'Enter your email address and password.',
              'Click <strong>Sign In</strong>. A 6-digit code will be sent to your email.',
              'Check your email and enter the code. Click <strong>Verify Code</strong>.',
              'You are now logged in and will see the home page.',
            ]} />
            <Note>If you see a red error message after clicking Sign In, double-check your email and password.</Note>
            <SubSection title="Forgot Your Password?">
              <Steps items={[
                'On the Login page, click <strong>Forgot password?</strong> below the Sign In button.',
                'Enter your registered email address and click <strong>Send Reset Code</strong>.',
                'Check your email for the 6-digit reset code and enter it.',
                'Create a new password and click <strong>Reset Password</strong>.',
                'You will be redirected to the Login page to sign in with your new password.',
              ]} />
            </SubSection>
            <SubSection title="Logging Out">
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", lineHeight: 1.7 }}>
                Click the <strong>🚪 Logout</strong> button at the bottom of the sidebar on the left side of the screen.
              </p>
            </SubSection>
          </Section>

          {/* ── Section 4: Navigating ── */}
          <Section id="navigate" title="4. Navigating the App">
            <Screenshot src="/help/sidebar.png" alt="Sidebar navigation" caption="The sidebar navigation menu." />
            <InfoTable
              headers={["Sidebar Item", "What it does"]}
              rows={[
                ["🔍 Search", "Home page — shows all your recipes and friends' recipes"],
                ["➕ Add Recipe", "Create a new recipe"],
                ["🥫 Inventory", "Manage your personal pantry inventory"],
                ["♻️ Recover Deleted", "Restore deleted recipes (within 30 days)"],
                ["🤝 Friends", "Add friends and manage friend requests"],
                ["📋 Copy Requests", "View and respond to recipe copy requests"],
                ["❓ Help", "This help guide"],
                ["🚪 Logout", "Log out of the application"],
              ]}
            />
            <Note>Red number badges on Friends or Copy Requests mean you have pending items that need attention.</Note>
            <Tip>Your logged-in email address is shown at the top of the sidebar so you always know which account you are using.</Tip>
          </Section>

          {/* ── Section 5: Managing Recipes ── */}
          <Section id="recipes" title="5. Managing Your Recipes">
            <SubSection title="Viewing and Searching Recipes">
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", lineHeight: 1.7, marginBottom: 12 }}>
                The home page shows your recipes organized by tabs:
              </p>
              <InfoTable
                headers={["Tab", "Shows"]}
                rows={[
                  ["All", "All your recipes plus friends' recipes"],
                  ["Keepers", "Only your recipes marked as Keepers ⭐"],
                  ["Save for Later", "Only your recipes marked as Save for Later 🕐"],
                ]}
              />
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", lineHeight: 1.7, margin: "12px 0" }}>
                To search, click the search bar and type a recipe name or ingredient name. Results filter automatically as you type.
              </p>
              <Tip>You can search by ingredient — typing "garlic" will show all recipes containing garlic.</Tip>
            </SubSection>

            <SubSection title="Adding a New Recipe">
              <Screenshot src="/help/add-recipe.png" alt="Add recipe page" caption="The Add Recipe form." />
              <Steps items={[
                'Click <strong>➕ Add Recipe</strong> in the sidebar or the "+ Add Recipe" button on the home page.',
                'Fill in the Recipe Name, Servings, and choose a Status (Keeper or Save for Later).',
                'Click <strong>+ Add Ingredient</strong> to add each ingredient with a name and amount.',
                'Click <strong>+ Add Step</strong> to add each instruction step.',
                'Optionally click <strong>+ Add Comment</strong> to add personal notes.',
                'Click <strong>✓ Save Recipe</strong> to save.',
              ]} />
            </SubSection>

            <SubSection title="Editing a Recipe">
              <Screenshot src="/help/edit-recipe.png" alt="Recipe detail page" caption="The Recipe Detail page — all fields are editable." />
              <Steps items={[
                'On the home page, click any recipe to open it.',
                'Click directly on any field to edit it — name, servings, ingredients, steps, or comments.',
                'Use the <strong>⭐ Keeper</strong> or <strong>🕐 Save for Later</strong> buttons to change the status.',
                'Click <strong>✓ Save Changes</strong> when finished.',
              ]} />
              <Note>Changes are NOT saved automatically. Always click Save Changes before leaving the page.</Note>
            </SubSection>

            <SubSection title="Deleting a Recipe">
              <Steps items={[
                'Open the recipe by clicking on it from the home page.',
                'Click the <strong>🗑 Delete</strong> button in the top-right.',
                'Click OK in the confirmation dialog.',
              ]} />
              <Note>Deleting moves the recipe to Trash for 30 days. You can recover it during this time.</Note>
            </SubSection>
          </Section>

          {/* ── Section 6: Recover ── */}
          <Section id="recover" title="6. Recovering Deleted Recipes">
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", lineHeight: 1.7, marginBottom: 16 }}>
              Deleted recipes are kept for 30 days before being permanently removed.
            </p>
            <Steps items={[
              'Click <strong>♻️ Recover Deleted</strong> in the sidebar.',
              'Find the recipe you want to restore in the list.',
              'Click the <strong>Restore</strong> button next to it.',
              'The recipe will immediately return to your home page.',
            ]} />
            <Note>Recipes deleted more than 30 days ago are permanently removed and cannot be recovered.</Note>
          </Section>

          {/* ── Section 7: Inventory ── */}
          <Section id="inventory" title="7. Managing Your Inventory">
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", lineHeight: 1.7, marginBottom: 16 }}>
              The Inventory tracks the pantry items you have at home. Your inventory is private — only you can see it.
            </p>
            <Screenshot src="/help/inventory.png" alt="Inventory page" caption="The Inventory page showing stock status for each item." />
            <SubSection title="Adding an Item">
              <Steps items={[
                'Click <strong>🥫 Inventory</strong> in the sidebar.',
                'Click <strong>+ Add Ingredient</strong>.',
                'Enter the name, amount, unit, and stock status.',
                'Click <strong>Add Ingredient</strong> to save.',
              ]} />
            </SubSection>
            <InfoTable
              headers={["Status", "Meaning"]}
              rows={[
                ["✅ In Stock", "You have enough of this item"],
                ["⚠️ Running Low", "You are almost out"],
                ["❌ Out of Stock", "You have none left"],
              ]}
            />
          </Section>

          {/* ── Section 8: Friends ── */}
          <Section id="friends" title="8. Friends & Sharing">
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", lineHeight: 1.7, marginBottom: 16 }}>
              Connect with friends to see each other's recipes on the home page. Friends' recipes appear with a <strong>👁 View Only</strong> badge.
            </p>
            <Screenshot src="/help/friends-page.png" alt="Friends page" caption="The Friends page for managing connections." />

            <SubSection title="Sending a Friend Request">
              <Steps items={[
                'Click <strong>🤝 Friends</strong> in the sidebar.',
                'In the <strong>Add a Friend</strong> section, enter your friend\'s email address.',
                'Click <strong>Send Request</strong>.',
              ]} />
              <Note>Your friend must already have a My Recipes account. You need their exact registered email address.</Note>
            </SubSection>

            <SubSection title="Accepting or Declining a Request">
              <Steps items={[
                'A red badge on the Friends sidebar item means you have a pending request.',
                'Click <strong>🤝 Friends</strong> in the sidebar.',
                'Under Pending Requests, click <strong>✓ Accept</strong> or <strong>Decline</strong>.',
              ]} />
            </SubSection>

            <SubSection title="Viewing Friends' Recipes">
              <Screenshot src="/help/view-only.png" alt="View Only recipe" caption="Friends' recipes appear with a View Only badge on the home page." />
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", lineHeight: 1.7, marginBottom: 12 }}>
                Friends' recipes appear on your home page in the All tab. Click any View Only recipe to see full details.
              </p>
              <Tip>Click the ✕ button on a View Only recipe to hide it. Use "Show hidden" below the tabs to reveal hidden recipes.</Tip>
            </SubSection>

            <SubSection title="Requesting a Copy of a Recipe">
              <Steps items={[
                'Click on a friend\'s View Only recipe to open it.',
                'Click the green <strong>📋 Request Copy</strong> button.',
                'The button changes to <strong>⏳ Request pending...</strong>',
                'Wait for your friend to approve. Once approved, the recipe appears in your own collection.',
              ]} />
            </SubSection>

            <SubSection title="Approving or Declining Copy Requests">
              <Steps items={[
                'A red badge on Copy Requests means someone wants a copy of your recipe.',
                'Click <strong>📋 Copy Requests</strong> in the sidebar.',
                'Click <strong>✓ Approve</strong> to share, or <strong>✕ Decline</strong> to deny.',
              ]} />
              <Note>Approving a copy does not remove the recipe from your collection. You keep your original.</Note>
            </SubSection>
          </Section>

          {/* ── Section 9: Security ── */}
          <Section id="security" title="9. Account Security">
            <InfoTable
              headers={["Security Feature", "Description"]}
              rows={[
                ["Two-Factor Authentication", "Every login requires a one-time code sent to your email in addition to your password."],
                ["Password Complexity", "Passwords must include uppercase, lowercase, numbers, and special characters."],
                ["Secure Cookie", "Your login session is stored in a secure, encrypted cookie that cannot be accessed by scripts."],
                ["Input Sanitization", "The app automatically blocks harmful code from being entered in any text field."],
                ["Rate Limiting", "The app limits how many actions can be performed in a short time to prevent abuse."],
              ]}
            />
          </Section>

          {/* ── Section 10: Troubleshooting ── */}
          <Section id="troubleshoot" title="10. Troubleshooting">
            <InfoTable
              headers={["Problem", "Solution"]}
              rows={[
                ["I did not receive a verification or login code", "Check your spam folder. Codes expire in 10 minutes — go back and request a new one if needed."],
                ["I see a red error message on the login page", "Read the error message — it will tell you what went wrong. Use Forgot password? if needed."],
                ["I accidentally deleted a recipe", "Click ♻️ Recover Deleted in the sidebar. You have 30 days to restore it."],
                ["I can't find a recipe I just added", "Make sure you are on the All tab on the home page. Check the Keepers and Save for Later tabs too."],
                ["The app is slow to load", "The server may be starting up — wait 30 seconds and refresh the page (press F5)."],
                ["My changes were not saved", "Make sure you clicked the green Save Changes button before leaving the recipe page."],
                ["I requested a copy but it hasn't appeared", "The recipe owner must approve your request. Contact your friend to let them know."],
                ["I see a friend's recipe twice", "Refresh the page. This can happen briefly after a copy is approved."],
              ]}
            />
          </Section>

          {/* ── Section 11: Quick Reference ── */}
          <Section id="quickref" title="11. Quick Reference">
            <InfoTable
              headers={["Task", "How to do it"]}
              rows={[
                ["Register", "App URL → Register → fill in details → verify email code"],
                ["Log in", "Enter email & password → enter 6-digit code from email"],
                ["Reset password", "Login page → Forgot password? → email → code → new password"],
                ["Add a recipe", "Sidebar → ➕ Add Recipe → fill in fields → ✓ Save Recipe"],
                ["Edit a recipe", "Home page → click recipe → edit fields → Save Changes"],
                ["Delete a recipe", "Open recipe → 🗑 Delete → confirm"],
                ["Recover a recipe", "Sidebar → ♻️ Recover Deleted → Restore"],
                ["Add inventory item", "Sidebar → 🥫 Inventory → + Add Ingredient"],
                ["Add a friend", "Sidebar → 🤝 Friends → enter email → Send Request"],
                ["Accept friend request", "Sidebar → 🤝 Friends → Pending Requests → ✓ Accept"],
                ["View friend's recipe", "Home page → click a View Only recipe"],
                ["Request a recipe copy", "Open friend's recipe → 📋 Request Copy"],
                ["Approve a copy request", "Sidebar → 📋 Copy Requests → ✓ Approve"],
                ["Hide a friend's recipe", "Home page → click ✕ on a View Only recipe"],
                ["Log out", "Sidebar → 🚪 Logout"],
              ]}
            />
          </Section>

          <div style={{ paddingTop: 32, borderTop: "1.5px solid var(--gray-mid)", textAlign: "center", color: "var(--gray)", fontSize: 13, fontWeight: 600 }}>
            My Recipes — Help Guide v1.0 · {new Date().getFullYear()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HelpPage;
