'use client';

import React, { useEffect, useState } from 'react';

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = (): void => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg bg-emerald-800/40 border border-emerald-600/30 animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-emerald-100 hover:text-white bg-emerald-800/60 hover:bg-emerald-700/80 border border-emerald-600/40 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label="Alternar tema de interfaz"
    >
      {isDark ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-amber-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-emerald-100"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
};
