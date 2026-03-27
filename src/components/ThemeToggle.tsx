'use client';

import React from 'react';

interface ThemeToggleProps {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, setTheme, className = '' }) => {
  return (
    <div className={`theme-switch-wrapper ${className}`}>
      <label className="theme-switch">
        <input 
          type="checkbox" 
          checked={theme === 'dark'}
          onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        />
        <span className="theme-slider">
          <span className="ts-icon-sun">☀️</span>
          <span className="ts-icon-moon">🌙</span>
        </span>
      </label>
    </div>
  );
};

export default ThemeToggle;
