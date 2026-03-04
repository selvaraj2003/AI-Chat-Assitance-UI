import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-toastify";
import "../styles/auth.css";
import "../styles/app.css";


export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

 const submit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await api.post("/api/auth/register", {
      username,
      email,
      password,
    });

    toast.success(res.data.message || "Account created successfully!");

    setTimeout(() => navigate("/login"), 1200);
  } catch (err) {
    const errorMsg =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      "Registration failed. Try again.";

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
          <h2 className="auth-title">Join Neural<span className="gradient-text-anim">AI</span></h2>
          <p className="auth-subtitle">Create your account to start chatting</p>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <div className="input-field">
            <input
              type="text"
              required
              minLength={3}
              placeholder=" " 
              onChange={(e) => setUsername(e.target.value)}
            />
            <label>Username</label>
          </div>

          <div className="input-field">
            <input
              type="email"
              required
              placeholder=" " 
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Email Address</label>
          </div>

          <div className="input-field">
            <input
              type="password"
              required
              minLength={8}
              placeholder=" " 
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Password</label>
          </div>

          <button className="auth-main-btn" disabled={loading}>
            {loading ? "Initializing..." : "Register Now"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <span onClick={() => navigate('/login')}>Login</span>
        </div>
      </div>
    </div>
  );
}