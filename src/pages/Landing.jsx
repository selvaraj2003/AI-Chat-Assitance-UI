import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AIBackground from "../components/AIBackground";
import "../styles/landing.css";

/* Features data */
const FEATURES = [
  { icon: "⚙️", title: "Automated Workflows", desc: "Streamline CI/CD pipelines and automate deployment tasks with intelligent orchestration." },
  { icon: "🔍", title: "Smart Monitoring", desc: "AI-driven insights for real-time infrastructure health, anomaly detection, and alerting." },
  { icon: "🔒", title: "Secure by Default", desc: "Continuous security checks, vulnerability scanning, and compliance enforcement." },
  { icon: "📊", title: "Analytics & Reporting", desc: "Generate actionable reports on build, test, and deployment metrics with advanced analytics." },
  { icon: "🤖", title: "ChatOps Integration", desc: "Collaborate and control your DevOps processes directly from chat interfaces." },
  { icon: "🛠️", title: "Customizable Automation", desc: "Adapt workflows, triggers, and AI recommendations to fit your team's needs." },
];

/* Theme Toggle Component */
function ThemeToggle({ theme, setTheme }) {
  return (
    <button 
      className="theme-toggle" 
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}

/* Component */
export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState(() => {
    // Get saved theme or default to dark
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="lp-root">
      <AIBackground theme={theme} intensity="medium" />
      <div className="lp-grain" />
      <div className="lp-glow-center" />
      <div className="lp-glow-bottom" />

      {/* Navbar */}
      <nav className={`lp-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="lp-logo">
          Gen<span className="lp-logo-x">Ops</span>
          <span className="lp-logo-dot" />
        </div>
        <div className="lp-nav-links">
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <button className="lp-nav-login" onClick={() => navigate("/login")}>
            Sign In
          </button>
          <button className="lp-nav-register" onClick={() => navigate("/register")}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-badge">
          <span className="lp-badge-blink" />
          Welcome to GenOps - AI-Powered DevOps Intelligence
        </div>

        <h1 className="lp-title">
            Intelligent<br />
            <span className="lp-title-line2">DevOps</span>
        </h1>

        <p className="lp-subtitle">
          Empower your DevOps journey with AI-driven automation, secure cloud workflows,
          and real-time insights for teams that demand reliability and speed.
        </p>

        <div className="lp-cta-group">
          <button className="lp-cta-primary" onClick={() => navigate("/register")}>
            Start for free →
          </button>
          <button className="lp-cta-secondary" onClick={() => navigate("/login")}>
            Sign in
          </button>
        </div>

        <div className="lp-stats">
          {[
            { num: "10×",  label: "Faster" },
            { num: "99.9%", label: "Uptime" },
            { num: "∞",    label: "Context" },
          ].map((s) => (
            <div key={s.label} className="lp-stat">
              <span className="lp-stat-num">{s.num}</span>
              <span className="lp-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <div className="lp-features">
        {FEATURES.map((f) => (
          <div key={f.title} className="lp-feat-card">
            <div className="lp-feat-icon">{f.icon}</div>
            <div className="lp-feat-title">{f.title}</div>
            <p className="lp-feat-desc">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="lp-footer">
        © {new Date().getFullYear()} GenOps · Built with intent
      </footer>
    </div>
  );
}