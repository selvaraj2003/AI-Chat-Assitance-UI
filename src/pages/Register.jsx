import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";
import "../styles/auth.css";

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/auth/register", { username, email, password });
      toast.success(res.data.message || "Account created!");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-ring" />
      <div className="auth-ring" />
      <div className="auth-ring" />
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />

      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">Flux<span>Ops</span></span>
          <h2 className="auth-title">Create account</h2>
          <p className="auth-subtitle">Join the next generation of AI chat</p>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <div className="af-field">
            <input
              type="text"
              required
              minLength={3}
              placeholder=" "
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <label>Username</label>
          </div>

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
              minLength={8}
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Password (min. 8 chars)</label>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating account…" : "Register →"}
          </button>
        </form>

        <div className="auth-foot">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Sign in</span>
        </div>
      </div>
    </div>
  );
}
