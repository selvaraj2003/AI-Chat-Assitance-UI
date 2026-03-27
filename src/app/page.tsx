"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AIBackground from "@/components/AIBackground";
import { useAuthStore } from "@/hooks/useAuthStore";
import "@/styles/landing.css";


const FEATURES = [
  { icon: "🛠️", title: "Instant Troubleshooting", desc: "Solve confusing terminal errors and deployment failures with AI that understands your specific environment." },
  { icon: "💻", title: "Smart Code Reviews", desc: "Get real-time suggestions for cleaner, more efficient code with automated bug detection and fixes." },
  { icon: "🏗️", title: "System Architecture", desc: "Design scalable systems with expert guidance on best practices, cloud infrastructure, and security." },
  { icon: "🛡️", title: "Proactive Security", desc: "Identify vulnerabilities before they reach production with automated deep-scans and remediation plans." },
  { icon: "📚", title: "Technical Wiki", desc: "Transform your internal documentation into a searchable, interactive knowledge base for the entire team." },
  { icon: "⚡", title: "Rapid Integration", desc: "Connect your existing tech stack directly to the AI for smarter workflows and automated process management." },
];


import ThemeToggle from "@/components/ThemeToggle";


export default function Landing() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>("light");
  const isLoggedIn = useAuthStore((state: any) => state.isLoggedIn);

  useEffect(() => {
    if (isLoggedIn) {
      router.push(`/${crypto.randomUUID()}`);
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    
    const savedTheme = (localStorage.getItem('theme') as 'dark' | 'light') || 'light';
    setTheme(savedTheme);
    
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="lp-root">
      <AIBackground theme={theme} intensity="medium" />
      <div className="lp-grain" />
      <div className="lp-glow-center" />
      <div className="lp-glow-bottom" />

      {}
      <nav className={`lp-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="lp-logo">
          Tech<span className="lp-logo-x">Assistance</span>
          <span className="lp-logo-dot" />
        </div>
        <div className="lp-nav-links">
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <button className="lp-nav-login" onClick={() => router.push("/login")}>
            Sign In
          </button>
          <button className="lp-nav-register" onClick={() => router.push("/register")}>
            Get Started
          </button>
        </div>
      </nav>

      {}
      <section className="lp-hero">
        <div className="lp-badge">
          <span className="lp-badge-blink" />
          Your AI Technical Partner for Modern Engineering
        </div>

        <h1 className="lp-title">
            Intelligent<br />
            <span className="lp-title-line2">Tech</span>
        </h1>

        <p className="lp-subtitle">
          Your AI-powered technical partner for instant troubleshooting, code optimization, 
          and architectural guidance. Solve complex problems in seconds, not hours.
        </p>

        <div className="lp-cta-group">
          <button className="lp-cta-primary" onClick={() => router.push("/register")}>
            Start for free →
          </button>
          <button className="lp-cta-secondary" onClick={() => router.push("/login")}>
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

      {}
      <div className="lp-features">
        {FEATURES.map((f) => (
          <div key={f.title} className="lp-feat-card">
            <div className="lp-feat-icon">{f.icon}</div>
            <div className="lp-feat-title">{f.title}</div>
            <p className="lp-feat-desc">{f.desc}</p>
          </div>
        ))}
      </div>

      {}
      <footer className="lp-footer">
        © {new Date().getFullYear()} Tech Assistance · Built with intent
      </footer>
    </div>
  );
}

