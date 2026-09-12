"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, Shield, User, GraduationCap, ChevronUp, ChevronDown } from "lucide-react";

export default function DemoSwitcherBar() {
  const { user, demoLogin, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // If in production mode, hide completely
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "false") {
    return null;
  }

  return (
    <div className="bg-slate-100 dark:bg-terminal-900 border-b border-slate-200 dark:border-terminal-700/80 text-xs py-1.5 px-4 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 font-mono font-semibold tracking-wider text-[11px] bg-slate-200 dark:bg-terminal-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-sm border border-slate-300 dark:border-terminal-700">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            DEMO SELECTOR
          </span>
          {!collapsed && (
            <span className="hidden md:inline font-mono text-[11px] text-slate-500 dark:text-slate-400">
              SWITCH ACCOUNT (BACKEND JWT AUTH):
            </span>
          )}
        </div>

        {!collapsed ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Student Switcher */}
            <button
              onClick={() => demoLogin("STUDENT")}
              disabled={loading}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm font-mono text-xs transition-all duration-150 active:translate-y-0.5 select-none ${
                user?.role === "STUDENT"
                  ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-electric border border-cyan-500/40 font-semibold"
                  : "bg-white dark:bg-terminal-850 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-terminal-500 border border-slate-200 dark:border-terminal-700"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-electric" />
              <span>[ ALEX // STUDENT ]</span>
              {user?.role === "STUDENT" && <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 ml-0.5 shadow-sm" />}
            </button>

            {/* Organizer Switcher */}
            <button
              onClick={() => demoLogin("ORGANIZER")}
              disabled={loading}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm font-mono text-xs transition-all duration-150 active:translate-y-0.5 select-none ${
                user?.role === "ORGANIZER"
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-warm border border-amber-500/40 font-semibold"
                  : "bg-white dark:bg-terminal-850 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-terminal-500 border border-slate-200 dark:border-terminal-700"
              }`}
            >
              <User className="w-3.5 h-3.5 text-amber-600 dark:text-amber-warm" />
              <span>[ ROBOTICS CLUB // ORGANIZER ]</span>
              {user?.role === "ORGANIZER" && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 ml-0.5 shadow-sm" />}
            </button>

            {/* Campus Manager Switcher */}
            <button
              onClick={() => demoLogin("CAMPUS_MANAGER")}
              disabled={loading}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm font-mono text-xs transition-all duration-150 active:translate-y-0.5 select-none ${
                user?.role === "CAMPUS_MANAGER"
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-phosphor-bright border border-emerald-500/40 font-semibold"
                  : "bg-white dark:bg-terminal-850 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-terminal-500 border border-slate-200 dark:border-terminal-700"
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-phosphor-bright" />
              <span>[ DR. SHARMA // MANAGER ]</span>
              {user?.role === "CAMPUS_MANAGER" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5 shadow-sm" />}
            </button>

            <button
              onClick={() => setCollapsed(true)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-sm hover:bg-slate-200 dark:hover:bg-terminal-800 transition-colors"
              title="Minimize Demo Bar"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setCollapsed(false)}
            className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-0.5 rounded-sm bg-white dark:bg-terminal-850 border border-slate-200 dark:border-terminal-700 font-mono text-[11px]"
          >
            <span>[ DEMO SWITCHER ]</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
