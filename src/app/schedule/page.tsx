"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  Calendar,
  MapPin,
  Flame,
  AlertTriangle,
  BookmarkX,
  Compass,
  ArrowUpRight,
  CalendarX2,
} from "lucide-react";
import CampusVerifiedBadge from "@/components/CampusVerifiedBadge";
import TiltCard from "@/components/TiltCard";
import StaggerGrid from "@/components/StaggerGrid";
import { useAuth } from "@/context/AuthContext";

export default function MySchedulePage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSchedule = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/saved", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [user]);

  const handleUnsave = async (eventId: string) => {
    try {
      const res = await fetch("/api/saved/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      if (res.ok) {
        fetchSchedule();
      }
    } catch (err) {
      console.error("Unsave error:", err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="glass p-8 rounded-3xl border border-white/10 shadow-2xl">
          <Clock className="w-10 h-10 text-signal-400 mx-auto mb-3" />
          <h2 className="font-display text-xl font-bold text-white mb-2">My Schedule</h2>
          <p className="text-xs text-slate-400 mb-6">
            Please sign in or select a demo role in the top evaluation bar to access your personal schedule and clash detector.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-signal-500 hover:bg-signal-400 text-white text-xs font-semibold transition"
          >
            Sign In to Account
          </Link>
        </div>
      </div>
    );
  }

  const conflictsCount = data?.conflictsCount || 0;
  const groups = data?.groups || { startingSoon: [], today: [], tomorrow: [], upcoming: [] };
  const totalSaved = data?.count || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-signal-400 font-semibold bg-signal-500/10 px-3 py-1 rounded-full border border-signal-500/20">
            Personal Agenda
          </span>
          <h1 className="font-display text-display-lg font-bold text-white tracking-tight mt-2">
            My schedule.
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Chronological calendar of verified campus events with instant clash detection.
          </p>
        </div>

        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 hover:border-signal-400/40 text-xs font-semibold text-white transition shrink-0 self-start sm:self-auto"
        >
          <Compass size={16} className="text-signal-400" />
          <span>+ Add Events</span>
        </Link>
      </div>

      {/* Conflicts Alert Banner if any clashes exist */}
      {conflictsCount > 0 && (
        <div className="mb-10 p-5 rounded-3xl bg-flare-500/10 border border-flare-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-black/20 animate-scale-in">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-flare-500/20 text-flare-400 border border-flare-400/30 shrink-0">
              <AlertTriangle size={20} className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-flare-300">
                {conflictsCount} Schedule {conflictsCount === 1 ? "Conflict" : "Conflicts"} Detected
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                You have saved multiple overlapping events. Check the clash indicators below to avoid double-booking.
              </p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-flare-400 bg-flare-500/20 px-3 py-1 rounded-full border border-flare-400/30 whitespace-nowrap self-start sm:self-auto">
            Action Recommended
          </span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4 animate-fade-in">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass h-28 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : totalSaved === 0 ? (
        <div className="glass py-20 text-center rounded-3xl p-8 max-w-xl mx-auto border border-white/10 animate-fade-in">
          <CalendarX2 className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="font-display text-lg font-bold text-white mb-1">Nothing saved yet</h3>
          <p className="text-xs text-slate-400 mb-6 max-w-sm mx-auto">
            Save an event from the discovery page and it will show up here, grouped chronologically with automatic clash warnings.
          </p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-signal-500 hover:bg-signal-400 text-white text-xs font-semibold transition"
          >
            Explore Verified Events
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {/* SECTION 1: STARTING SOON (<24h) */}
          {groups.startingSoon.length > 0 && (
            <section className="space-y-4">
              <div className="sticky top-20 z-10 -mx-4 bg-void-950/80 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Flame size={16} className="text-flare-400 fill-flare-400 animate-pulse" />
                  <h2 className="font-display text-lg font-bold text-white">Starting Soon</h2>
                </div>
                <span className="text-xs font-mono text-flare-400 font-semibold">{groups.startingSoon.length} events</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.startingSoon.map((event: any) => (
                  <ScheduleItemCard key={event.id} event={event} onUnsave={handleUnsave} isHighlight />
                ))}
              </div>
            </section>
          )}

          {/* SECTION 2: TODAY */}
          {groups.today.length > 0 && (
            <section className="space-y-4">
              <div className="sticky top-20 z-10 -mx-4 bg-void-950/80 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-signal-400" />
                  <h2 className="font-display text-lg font-bold text-white">Today</h2>
                </div>
                <span className="text-xs font-mono text-slate-400">({groups.today.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.today.map((event: any) => (
                  <ScheduleItemCard key={event.id} event={event} onUnsave={handleUnsave} />
                ))}
              </div>
            </section>
          )}

          {/* SECTION 3: TOMORROW */}
          {groups.tomorrow.length > 0 && (
            <section className="space-y-4">
              <div className="sticky top-20 z-10 -mx-4 bg-void-950/80 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-verified-400" />
                  <h2 className="font-display text-lg font-bold text-white">Tomorrow</h2>
                </div>
                <span className="text-xs font-mono text-slate-400">({groups.tomorrow.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.tomorrow.map((event: any) => (
                  <ScheduleItemCard key={event.id} event={event} onUnsave={handleUnsave} />
                ))}
              </div>
            </section>
          )}

          {/* SECTION 4: UPCOMING */}
          {groups.upcoming.length > 0 && (
            <section className="space-y-4">
              <div className="sticky top-20 z-10 -mx-4 bg-void-950/80 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
                  <h2 className="font-display text-lg font-bold text-white">Later & Upcoming</h2>
                </div>
                <span className="text-xs font-mono text-slate-400">({groups.upcoming.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.upcoming.map((event: any) => (
                  <ScheduleItemCard key={event.id} event={event} onUnsave={handleUnsave} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function ScheduleItemCard({
  event,
  onUnsave,
  isHighlight = false,
}: {
  event: any;
  onUnsave: (id: string) => void;
  isHighlight?: boolean;
}) {
  return (
    <TiltCard maxTilt={3} className="h-full">
      <div
        className={`glass p-5 rounded-3xl border transition-all duration-300 ease-cinematic hover:shadow-2xl relative flex flex-col justify-between h-full group ${
          event.hasClash
            ? "border-flare-400/40 bg-void-900/90 shadow-md shadow-flare-500/10"
            : isHighlight
            ? "border-flare-500/30"
            : "border-white/10 hover:border-white/20"
        }`}
      >
        <div>
          {/* Top Badges & Clash Alert */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-void-950/80 px-2.5 py-0.5 text-[10px] font-medium text-slate-300 border border-white/10">
                {event.category}
              </span>
              <CampusVerifiedBadge size="sm" />
            </div>

            <button
              onClick={() => onUnsave(event.id)}
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-full hover:bg-white/5 transition active:scale-90"
              title="Remove from schedule"
            >
              <BookmarkX size={16} />
            </button>
          </div>

          {/* Clash Banner if conflicting */}
          {event.hasClash && event.conflictDetails && (
            <div className="mb-3 p-3 rounded-2xl bg-flare-500/10 border border-flare-400/30 text-xs animate-scale-in">
              <div className="flex items-center gap-1.5 font-bold text-flare-400 mb-0.5">
                <AlertTriangle size={14} className="animate-pulse" />
                <span>SCHEDULE CLASH</span>
              </div>
              <p className="text-[11px] text-flare-200">
                Overlaps with: <span className="font-semibold">{event.conflictDetails.conflictingEventTitle}</span> ({event.conflictDetails.overlapStr})
              </p>
            </div>
          )}

          {/* Title */}
          <Link href={`/events/${event.id}`}>
            <h3 className="font-display text-base font-semibold text-white group-hover:text-signal-300 transition-colors line-clamp-1 mb-2">
              {event.title}
            </h3>
          </Link>

          {/* Date & Location */}
          <div className="space-y-1 text-xs text-slate-400 mb-3">
            <div className="flex items-center gap-2 font-medium text-slate-300">
              <Calendar size={13} className="text-flare-400 shrink-0" />
              <span>{event.countdown}</span>
              <span className="text-slate-500 font-mono">({event.date})</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-slate-500 shrink-0" />
              <span>{event.startTime} – {event.endTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={13} className="text-slate-500 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400 font-medium truncate max-w-[200px]">
            By {event.organizerName || event.organizer?.name || "Campus Club"}
          </span>
          <Link
            href={`/events/${event.id}`}
            className="inline-flex items-center gap-1 font-semibold text-signal-400 hover:text-signal-300"
          >
            <span>View</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </TiltCard>
  );
}
