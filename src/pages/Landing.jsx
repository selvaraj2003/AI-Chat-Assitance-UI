import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/landing.css';
import "../styles/app.css";



const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-wrapper">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-logo">
          <Link to="/" className="logo-link">
            NEURAL<span>X</span>
          </Link>
        </div>
        <div className="nav-actions">
          <button className="login-link" onClick={() => navigate('login')}>Login</button>
          <button className="register-btn" onClick={() => navigate('register')}>Register</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-container">
          <div className="overlay-gradient"></div>
          <img 
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=2000" 
            alt="AI Art" 
            className="hero-bg-image"
          />
        </div>

        <div className="hero-content">
          <h1 className="hero-title">
            The Intelligence <br />
            <span className="gradient-text">Beyond Human</span>
          </h1>
          <p className="hero-subtitle">
            The next generation of conversational AI. Fast, secure, and infinitely capable.
          </p>
          <div className="hero-buttons">
            <button className="main-cta" onClick={() => navigate('register')}>Get Started</button>
            <button className="secondary-cta" onClick={() => navigate('login')}>Try Demo</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;