"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ShieldCheck, GraduationCap, User, Lock, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import CampusVerifiedBadge from "@/components/CampusVerifiedBadge";

export default function LoginPage() {
  const { login, demoLogin } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      router.push("/events");
    } else {
      setError(res.error || "Invalid credentials.");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-black text-white">Sign In to Campus Hub</h1>
        <p className="text-xs text-slate-400 mt-1">
          Access your personal schedule, submit event posters, or verify campus submissions.
        </p>
      </div>

      {/* Demo Evaluation Presets */}
      <div className="mb-6 p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-2.5 shadow-sm">
        <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold block">
          ⚡ 1-Click Demo Evaluation Sign In
        </span>
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => demoLogin("STUDENT")}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white transition"
          >
            <span className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>Alex Johnson (Student)</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">Sign In →</span>
          </button>

          <button
            type="button"
            onClick={() => demoLogin("ORGANIZER")}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white transition"
          >
            <span className="flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              <span>Robotics Club (Organizer)</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">Sign In →</span>
          </button>

          <button
            type="button"
            onClick={() => demoLogin("CAMPUS_MANAGER")}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white transition"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Dr. Sharma (Campus Manager)</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">Sign In →</span>
          </button>
        </div>
      </div>

      <div className="relative flex py-2 items-center mb-6">
        <div className="flex-grow border-t border-slate-800"></div>
        <span className="flex-shrink mx-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          Or Enter Credentials
        </span>
        <div className="flex-grow border-t border-slate-800"></div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Campus Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex@campus.edu"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-glow-brand transition disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In to Campus Hub"}
        </button>

        <p className="text-center text-xs text-slate-400 pt-2">
          Don't have an account?{" "}
          <Link href="/register" className="text-indigo-400 font-bold hover:underline">
            Register as Student / Club
          </Link>
        </p>
      </form>
    </div>
  );
}
