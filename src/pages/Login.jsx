import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from "../api/axios";
import '../styles/auth.css';
import "../styles/app.css";


const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await api.post("/api/auth/login", {
      email,
      password,
    });

    localStorage.setItem("token", res.data.access_token);
    localStorage.setItem("isLoggedIn", "true");

    toast.success("Welcome back to NeuralAI!");

    navigate("/chat");
  } catch (err) {
    const errorMsg =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      "Invalid email or password";

    toast.error(errorMsg);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-page">
      <div className="auth-bg-container">
        <div className="auth-overlay"></div>
        <img 
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=2000" 
          alt="AI Background" 
          className="auth-bg-image"
        />
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Neural<span className="gradient-text-anim">AI</span> Login</h2>
          <p className="auth-subtitle">Enter your details to access your neural workspace</p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="input-field">
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" " 
            />
            <label>Email Address</label>
          </div>

          <div className="input-field">
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" " 
            />
            <label>Password</label>
          </div>

          <div className="auth-meta">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: '#6366f1' }} />
              Remember me
            </label>
            <a href="#" className="forgot-pass">Forgot?</a>
          </div>

          <button type="submit" className="auth-main-btn" disabled={loading}>
            {loading ? "Authenticating..." : "Login to Dashboard"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <span onClick={() => navigate('/register')}>Create Account</span>
        </div>
      </div>
    </div>
  );
};

export default Login;