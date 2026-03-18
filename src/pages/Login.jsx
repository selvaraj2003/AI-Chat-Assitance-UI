import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";
import AIBackground from "../components/AIBackground";
import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("isLoggedIn", "true");
      toast.success("Welcome back!");
      navigate("/chat");
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Invalid email or password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* AI Background */}
      <AIBackground theme={theme} intensity="medium" />
      <div className="auth-grain" />
      
      {/* Theme Toggle */}
      <button 
        className="theme-toggle" 
        onClick={() => {
          const newTheme = theme === 'dark' ? 'light' : 'dark';
          setTheme(newTheme);
          localStorage.setItem('theme', newTheme);
        }}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">
            Gen<span>Ops</span>
          </span>
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to your neural workspace</p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="af-field">
            <input
              type="email"
              required
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Email address</label>
          </div>

          <div className="af-field">
            <input
              type="password"
              required
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Password</label>
          </div>

          <div className="auth-meta">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <a href="#">Forgot password?</a>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Authenticating…" : "Sign in →"}
          </button>
        </form>

        <div className="auth-foot">
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")}>Create one</span>
        </div>
      </div>
    </div>
  );
}