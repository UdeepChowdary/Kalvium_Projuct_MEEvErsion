"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Sparkles,
  Compass,
  ShieldCheck,
  Clock,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <header className="bg-white dark:bg-terminal-900/95 border-b border-slate-200 dark:border-terminal-700/80 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group select-none">
              <div className="w-8 h-8 rounded-sm bg-terminal-850 border border-slate-300 dark:border-terminal-700 flex items-center justify-center group-hover:border-cyan-400 transition-colors">
                <span className="font-mono font-bold text-xs text-cyan-600 dark:text-cyan-electric">&gt;_</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black tracking-tight text-lg text-slate-900 dark:text-white block leading-none">
                    CAMPUSHUB
                  </span>
                  <span className="w-1.5 h-3 bg-cyan-500 inline-block animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="phosphor-dot" />
                  <span className="text-[10px] tracking-widest uppercase text-slate-500 dark:text-slate-400 font-mono font-semibold">
                    SYSTEM ONLINE
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links - Monospaced Workstation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 dark:bg-terminal-950 p-1 rounded-sm border border-slate-200 dark:border-terminal-700/80">
            <Link
              href="/events"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-mono text-xs uppercase tracking-wider transition-all duration-150 active:translate-y-0.5 select-none ${
                isActive("/events")
                  ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-electric border border-cyan-500/40 font-bold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-terminal-850 border border-transparent hover:border-slate-300 dark:hover:border-terminal-700"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>[ 01 // EVENTS ]</span>
            </Link>

            {/* Student Links: Events -> Schedule */}
            {(!user || user.role === "STUDENT") && (
              <Link
                href="/schedule"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-mono text-xs uppercase tracking-wider transition-all duration-150 active:translate-y-0.5 select-none ${
                  isActive("/schedule")
                    ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-electric border border-cyan-500/40 font-bold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-terminal-850 border border-transparent hover:border-slate-300 dark:hover:border-terminal-700"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>[ 02 // MY SCHEDULE ]</span>
              </Link>
            )}

            {/* Organizer Links: Events -> Organizer Studio */}
            {user?.role === "ORGANIZER" && (
              <Link
                href="/dashboard/organizer"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-mono text-xs uppercase tracking-wider transition-all duration-150 active:translate-y-0.5 select-none ${
                  isActive("/dashboard/organizer")
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-warm border border-amber-500/40 font-bold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-terminal-850 border border-transparent hover:border-slate-300 dark:hover:border-terminal-700"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>[ 02 // ORGANIZER STUDIO ]</span>
              </Link>
            )}

            {/* Campus Manager Links: Events -> Verification Center */}
            {user?.role === "CAMPUS_MANAGER" && (
              <Link
                href="/dashboard/manager"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-mono text-xs uppercase tracking-wider transition-all duration-150 active:translate-y-0.5 select-none ${
                  isActive("/dashboard/manager")
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-phosphor-bright border border-emerald-500/40 font-bold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-terminal-850 border border-transparent hover:border-slate-300 dark:hover:border-terminal-700"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-phosphor-bright" />
                <span>[ 02 // VERIFICATION ]</span>
              </Link>
            )}
          </nav>

          {/* User Badge / Profile & Actions & Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-2.5 p-1 pl-2.5 bg-slate-50 dark:bg-terminal-850 rounded-sm border border-slate-200 dark:border-terminal-700 shadow-xs">
                <div className="text-right font-mono">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight uppercase">{user.name}</p>
                  <span
                    className={`inline-block text-[10px] font-mono px-1 py-0.2 rounded-xs font-semibold uppercase ${
                      user.role === "CAMPUS_MANAGER"
                        ? "text-emerald-700 dark:text-phosphor-bright"
                        : user.role === "ORGANIZER"
                        ? "text-amber-700 dark:text-amber-warm"
                        : "text-cyan-700 dark:text-cyan-electric"
                    }`}
                  >
                    // {user.role.replace("_", " ")}
                  </span>
                </div>

                <div className="w-8 h-8 rounded-sm bg-slate-200 dark:bg-terminal-800 border border-slate-300 dark:border-terminal-700 flex items-center justify-center font-mono font-bold text-xs text-cyan-600 dark:text-cyan-electric overflow-hidden select-none">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>

                <button
                  onClick={() => logout()}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-terminal-800 rounded-sm transition-colors active:translate-y-0.5 font-mono text-xs"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="font-mono text-xs uppercase px-3 py-1.5 rounded-sm border border-slate-300 dark:border-terminal-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-terminal-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  [ SIGN IN ]
                </Link>
                <Link
                  href="/register"
                  className="font-mono text-xs uppercase px-3 py-1.5 rounded-sm bg-cyan-500 dark:bg-cyan-electric text-slate-950 font-bold border border-cyan-400 hover:bg-cyan-400 transition-colors shadow-xs"
                >
                  [ REGISTER ]
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-sm border border-slate-200 dark:border-terminal-700 bg-white dark:bg-terminal-850 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-terminal-700 bg-white dark:bg-terminal-950 px-4 pt-3 pb-5 space-y-2 font-mono">
            <Link
              href="/events"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-sm text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-terminal-850 text-xs uppercase tracking-wider"
            >
              [ 01 // EVENTS ]
            </Link>
            {(!user || user.role === "STUDENT") && (
              <Link
                href="/schedule"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-sm text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-terminal-850 text-xs uppercase tracking-wider"
              >
                [ 02 // MY SCHEDULE ]
              </Link>
            )}

            {user?.role === "ORGANIZER" && (
              <Link
                href="/dashboard/organizer"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-sm text-amber-700 dark:text-amber-warm bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs uppercase tracking-wider font-semibold"
              >
                [ 02 // ORGANIZER STUDIO ]
              </Link>
            )}

            {user?.role === "CAMPUS_MANAGER" && (
              <Link
                href="/dashboard/manager"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-sm bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-phosphor-bright border border-emerald-200 dark:border-emerald-800/80 text-xs uppercase tracking-wider font-semibold"
              >
                [ 02 // VERIFICATION ]
              </Link>
            )}

            {user ? (
              <div className="pt-3 border-t border-slate-200 dark:border-terminal-700 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">{user.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">// {user.role.replace("_", " ")}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="font-mono text-xs text-red-500 font-semibold px-2.5 py-1 rounded-sm border border-red-500/30 hover:bg-red-500/10 transition-colors"
                >
                  [ SIGN OUT ]
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-200 dark:border-terminal-700 grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-sm border border-slate-300 dark:border-terminal-700 text-slate-800 dark:text-white text-xs uppercase"
                >
                  [ SIGN IN ]
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-sm bg-cyan-500 dark:bg-cyan-electric text-slate-950 text-xs uppercase font-bold"
                >
                  [ REGISTER ]
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Sticky Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-terminal-950 border-t border-slate-200 dark:border-terminal-700 flex items-center justify-around py-2 px-3 shadow-lg font-mono">
        <Link
          href="/events"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-sm transition-colors ${
            isActive("/events") ? "text-cyan-600 dark:text-cyan-electric font-bold" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span className="text-[10px] uppercase tracking-wider">EVENTS</span>
        </Link>

        {(!user || user.role === "STUDENT") && (
          <Link
            href="/schedule"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-sm transition-colors ${
              isActive("/schedule") ? "text-cyan-600 dark:text-cyan-electric font-bold" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider">SCHEDULE</span>
          </Link>
        )}

        {user?.role === "ORGANIZER" && (
          <Link
            href="/dashboard/organizer"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-sm transition-colors ${
              isActive("/dashboard/organizer") ? "text-amber-600 dark:text-amber-warm font-bold" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] uppercase tracking-wider">STUDIO</span>
          </Link>
        )}

        {user?.role === "CAMPUS_MANAGER" && (
          <Link
            href="/dashboard/manager"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-sm transition-colors ${
              isActive("/dashboard/manager") ? "text-emerald-600 dark:text-phosphor-bright font-bold" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] uppercase tracking-wider">VERIFY</span>
          </Link>
        )}

        {user ? (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <div className="w-4 h-4 rounded-sm bg-slate-200 dark:bg-terminal-800 border border-slate-300 dark:border-terminal-700 flex items-center justify-center text-[9px] font-bold text-cyan-600 dark:text-cyan-electric">
              {user.name.charAt(0)}
            </div>
            <span className="text-[10px] uppercase tracking-wider">MENU</span>
          </button>
        ) : (
          <Link
            href="/login"
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <div className="w-4 h-4 rounded-sm bg-slate-200 dark:bg-terminal-800 border border-slate-300 dark:border-terminal-700 flex items-center justify-center text-[9px] font-bold">
              &gt;
            </div>
            <span className="text-[10px] uppercase tracking-wider">LOGIN</span>
          </Link>
        )}
      </nav>
    </>
  );
}
