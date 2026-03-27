'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import { useAuthStore } from "@/hooks/useAuthStore";
import AIBackground from "@/components/AIBackground";
import ThemeToggle from "@/components/ThemeToggle";
import "@/styles/auth.css";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as "dark" | "light") || 'light';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/api/auth/register", { username, email, password });
      return res.data;
    },
    onSuccess: (data: any) => {
      toast.success(data.message || "Account created!");
      setTimeout(() => router.push("/login"), 1200);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || err.response?.data?.message || "Registration failed. Please try again.";
      toast.error(msg);
    },
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate();
  };

  return (
    <div className="auth-root">
      <AIBackground theme={theme} intensity="medium" />
      <div className="auth-grain" />
      
      <ThemeToggle theme={theme} setTheme={setTheme} className="auth-theme-toggle" />

      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">
            Tech<span>Assistance</span>
          </span>
          <h2 className="auth-title">Create account</h2>
          <p className="auth-subtitle">Join the next generation of technical support</p>
        </div>

        <form className="auth-form" onSubmit={handleRegister}>
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

          <div className="auth-meta">
            <label>
              <input 
                type="checkbox" 
                checked={agreed} 
                onChange={(e) => setAgreed(e.target.checked)} 
              />
              <span className="custom-cb" />
              I agree to the Terms of Service
            </label>
          </div>

          <button 
            type="submit" 
            className="auth-btn" 
            disabled={registerMutation.isPending || !agreed}
          >
            {registerMutation.isPending ? "Creating account..." : "Register →"}
          </button>
        </form>

        <div className="auth-foot">
          Already have an account?{" "}
          <span onClick={() => router.push("/login")} style={{ cursor: 'pointer', color: 'var(--primary)' }}>Sign in</span>
        </div>
      </div>
    </div>
  );
}
