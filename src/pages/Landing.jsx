import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/landing.css";

/* ── Particle network canvas ─────────────────────────────── */
function ParticleCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let raf;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const ACCENT = { r: 0, g: 229, b: 255 };
    const N = Math.min(Math.floor(window.innerWidth / 14), 90);

    const particles = Array.from({ length: N }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r:  Math.random() * 1.6 + 0.6,
    }));

    const mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const onMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener("mousemove", onMove);

    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Mouse repulsion
      particles.forEach((p) => {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d  = Math.hypot(dx, dy);
        if (d < 120) {
          p.vx += (dx / d) * 0.04;
          p.vy += (dy / d) * 0.04;
        }
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width)  p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      // Connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const d = dist(particles[i], particles[j]);
          if (d < 130) {
            const a = 1 - d / 130;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${a * 0.18})`;
            ctx.lineWidth   = 0.7;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Dots
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},0.55)`;
        ctx.fill();

        // Glow
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        grad.addColorStop(0, `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},0.15)`);
        grad.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return <canvas ref={ref} className="lp-canvas" />;
}

/* ── Features data ───────────────────────────────────────── */
const FEATURES = [
  { icon: "⚡", title: "Lightning Fast",     desc: "Sub-second response times powered by optimized neural inference pipelines." },
  { icon: "🧠", title: "Multi-Model",        desc: "Switch between local and cloud models seamlessly within the same conversation." },
  { icon: "🔒", title: "Private by Design",  desc: "Your conversations stay yours. Local model support means zero data leaves your machine." },
  { icon: "📐", title: "Markdown & LaTeX",   desc: "Full markdown rendering, syntax-highlighted code blocks, and beautiful math equations." },
  { icon: "🌐", title: "Session Memory",     desc: "Persistent conversation history across sessions so you never lose context." },
  { icon: "🎨", title: "Customisable",       desc: "Choose your AI provider, model, and preferences on the fly." },
];

/* ── Component ───────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="lp-root">
      <ParticleCanvas />
      <div className="lp-grain" />
      <div className="lp-glow-center" />
      <div className="lp-glow-bottom" />

      {/* Navbar */}
      <nav className={`lp-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="lp-logo">
          NEURAL<span className="lp-logo-x">X</span>
          <span className="lp-logo-dot" />
        </div>
        <div className="lp-nav-links">
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
          Now live · v2.0
        </div>

        <h1 className="lp-title">
          Intelligence<br />
          <span className="lp-title-line2">Beyond Human</span>
        </h1>

        <p className="lp-subtitle">
          The next generation of conversational AI. Local or cloud, fast, private,
          and infinitely capable — built for those who demand more.
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
        © {new Date().getFullYear()} NeuralX · Built with intent
      </footer>
    </div>
  );
}
