'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import AIBackground from "@/components/AIBackground";
import { useAuthStore } from "@/hooks/useAuthStore";
import ThemeToggle from "@/components/ThemeToggle";
import "@/styles/auth.css";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state: any) => state.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as "dark" | "light") || 'light';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/api/auth/login", { email, password });
      return res.data;
    },
    onSuccess: (data: any) => {
      setAuth(data.user, data.access_token);
      toast.success("Welcome back!");
      router.push("/");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || err.response?.data?.message || "Invalid email or password";
      toast.error(msg);
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };



  return (
    <div className="auth-root">
      <AIBackground theme={theme} intensity="medium" />
      <div className="auth-grain" />
      
      <ThemeToggle theme={theme} setTheme={setTheme} className="auth-theme-toggle" />

      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">
            Tech<span> Assistance</span>
          </span>
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to your tech workspace</p>
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
              <input type="checkbox" />
              <span className="custom-cb" />
              Remember me
            </label>
            <a href="#">Forgot password?</a>
          </div>

          <button type="submit" className="auth-btn" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Authenticating..." : "Sign in →"}
          </button>
        </form>

        <div className="auth-foot">
          Don't have an account?{" "}
          <span onClick={() => router.push("/register")} style={{ cursor: 'pointer', color: 'var(--primary)' }}>Create one</span>
        </div>
      </div>
    </div>
  );
}
