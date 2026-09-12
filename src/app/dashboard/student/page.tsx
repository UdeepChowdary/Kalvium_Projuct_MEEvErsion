"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Flame,
  AlertTriangle,
  Compass,
  ArrowRight,
  ShieldCheck,
  Bookmark,
} from "lucide-react";
import CampusVerifiedBadge from "@/components/CampusVerifiedBadge";
import { useAuth } from "@/context/AuthContext";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/saved", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-slate-400 mb-4">Please log in to view your student dashboard.</p>
        <Link href="/login" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
          Sign In
        </Link>
      </div>
    );
  }

  const conflictsCount = data?.conflictsCount || 0;
  const savedEvents = data?.events || [];
  const startingSoonEvent = savedEvents.find((e: any) => e.isStartingSoon);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero Welcome */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
            Student Portal
          </span>
          <CampusVerifiedBadge size="sm" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight">
          Good morning, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="text-base text-slate-300 mt-2">
          Here's what's happening on your campus today.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:shadow-card-hover animate-slide-up stagger-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold block mb-1">
            SAVED EVENTS
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display font-black text-white">{savedEvents.length}</span>
            <span className="text-xs text-slate-400">on personal schedule</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:shadow-card-hover animate-slide-up stagger-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold block mb-1">
            STARTING SOON
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display font-black text-rose-400">
              {savedEvents.filter((e: any) => e.isStartingSoon).length}
            </span>
            <span className="text-xs text-slate-400">within 24 hours</span>
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border shadow-sm transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:shadow-card-hover animate-slide-up stagger-3 ${
            conflictsCount > 0
              ? "bg-amber-950/30 border-amber-500/40"
              : "bg-slate-900/90 border-slate-800"
          }`}
        >
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold block mb-1 text-amber-400">
            SCHEDULE CONFLICTS
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display font-black text-amber-400">
              {conflictsCount}
            </span>
            <span className="text-xs text-slate-300">
              {conflictsCount === 1 ? "overlapping clash" : "overlapping clashes"}
            </span>
          </div>
          {conflictsCount > 0 && (
            <Link
              href="/schedule"
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 mt-2 transition-colors"
            >
              <span>Review your saved events →</span>
            </Link>
          )}
        </div>
      </div>

      {/* Starting Soon Spotlight Card if applicable */}
      {startingSoonEvent && (
        <div className="mb-10 p-6 rounded-3xl bg-gradient-to-r from-rose-950/50 via-slate-900 to-indigo-950/40 border border-rose-500/40 shadow-editorial relative overflow-hidden animate-scale-in">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-600 text-white flame-glow-badge flex items-center gap-1.5 shadow-sm">
              <Flame className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
              <span>STARTING SOON SPOTLIGHT</span>
            </span>
            <CampusVerifiedBadge size="sm" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
                {startingSoonEvent.title}
              </h2>
              <div className="flex items-center gap-4 text-xs text-slate-300 font-medium flex-wrap">
                <span className="text-rose-400 font-bold">{startingSoonEvent.countdown}</span>
                <span>•</span>
                <span>{startingSoonEvent.startTime} – {startingSoonEvent.endTime}</span>
                <span>•</span>
                <span>{startingSoonEvent.venue}</span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 mt-2">
                {startingSoonEvent.summary}
              </p>
            </div>

            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <Link
                href={`/events/${startingSoonEvent.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg transition-all duration-200 ease-out-expo active:scale-95"
              >
                <span>View Event Details</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout: Upcoming Agenda vs Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Your Upcoming Events */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-extrabold uppercase tracking-wider text-white">
              Your Upcoming Saved Events
            </h2>
            <Link
              href="/schedule"
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
            >
              Full Schedule View →
            </Link>
          </div>

          {savedEvents.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <p className="text-xs text-slate-400 mb-3">You haven't saved any events yet.</p>
              <Link
                href="/events"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Explore Events</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {savedEvents.slice(0, 5).map((ev: any, idx: number) => (
                <div
                  key={ev.id}
                  className={`group p-4 rounded-xl border flex items-center justify-between gap-4 transition-all duration-200 ease-out-expo hover:-translate-y-0.5 hover:shadow-md animate-slide-up stagger-${(idx % 5) + 1} ${
                    ev.hasClash
                      ? "bg-slate-900/90 border-amber-500/50"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono uppercase bg-slate-800 text-indigo-300 px-2 py-0.5 rounded font-bold">
                        {ev.category}
                      </span>
                      {ev.hasClash && (
                        <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Schedule Conflict</span>
                        </span>
                      )}
                    </div>
                    <Link href={`/events/${ev.id}`}>
                      <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                        {ev.title}
                      </h4>
                    </Link>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span>{ev.countdown}</span>
                      <span>•</span>
                      <span>{ev.venue}</span>
                    </div>
                  </div>

                  <Link
                    href={`/events/${ev.id}`}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white shrink-0 transition-all duration-200 active:scale-95 group-hover:translate-x-0.5"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick Discovery & Tips */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              Campus Trust Principle
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every event visible in the student explore portal has been verified against the organizer's original poster by the Campus Manager.
            </p>
            <div className="pt-2">
              <CampusVerifiedBadge size="sm" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
            <h3 className="text-xs font-bold text-indigo-300">Need to find more events?</h3>
            <p className="text-xs text-slate-300">
              Discover hackathons, workshops, music nights, and athletic tournaments happening this week.
            </p>
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300"
            >
              <span>Browse All Events →</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
