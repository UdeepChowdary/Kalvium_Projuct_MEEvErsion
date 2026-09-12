"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-8 h-8 rounded-sm border border-slate-200 dark:border-terminal-700 bg-slate-100 dark:bg-terminal-850 ${className}`} />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative p-2 rounded-sm border transition-all duration-150 active:translate-y-0.5 flex items-center justify-center ${
        isDark
          ? "border-terminal-700 bg-terminal-850 text-amber-400 hover:text-amber-300 hover:border-terminal-500 shadow-sm"
          : "border-slate-300 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-400 shadow-sm"
      } ${className}`}
      title={isDark ? "Switch to Light theme" : "Switch to Dark theme"}
      aria-label={isDark ? "Switch to Light theme" : "Switch to Dark theme"}
    >
      <div className="relative w-4 h-4">
        <Sun
          className={`w-4 h-4 absolute inset-0 transition-transform duration-500 ease-cinematic ${
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100 text-amber-500"
          }`}
        />
        <Moon
          className={`w-4 h-4 absolute inset-0 transition-transform duration-500 ease-cinematic ${
            isDark
              ? "rotate-0 scale-100 opacity-100 text-indigo-300"
              : "-rotate-90 scale-0 opacity-0"
          }`}
        />
      </div>
    </button>
  );
}
