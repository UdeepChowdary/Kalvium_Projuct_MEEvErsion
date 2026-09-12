"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Flame,
  CheckCircle2,
} from "lucide-react";
import CampusVerifiedBadge from "./CampusVerifiedBadge";
import ClashWarningModal from "./ClashWarningModal";
import { useAuth } from "@/context/AuthContext";
import { isStartingSoon, getHumanCountdown } from "@/lib/time";
import { EventCardData } from "./EventCard";

interface EventDetailDrawerProps {
  event: EventCardData | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveToggle?: (eventId: string, isSaved: boolean) => void;
}

export default function EventDetailDrawer({
  event,
  isOpen,
  onClose,
  onSaveToggle,
}: EventDetailDrawerProps) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clashModalOpen, setClashModalOpen] = useState(false);
  const [clashData, setClashData] = useState<any>(null);

  useEffect(() => {
    if (event) {
      setIsSaved(Boolean(event.isSaved));
    }
  }, [event]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !clashModalOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, clashModalOpen, onClose]);

  if (!isOpen || !event) return null;

  const startingSoon = isStartingSoon(event.date, event.startTime);
  const countdownText = getHumanCountdown(event.date, event.startTime);

  const handleSaveClick = async () => {
    if (!user) {
      alert("Please sign in or select a demo user in the top bar to save events.");
      return;
    }

    if (isSaved) {
      executeToggle(false);
      return;
    }

    // Pre-check for clash
    setSaving(true);
    try {
      const res = await fetch("/api/saved/check-clash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event.id }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.hasClash && data.conflictingEvent) {
          setClashData(data);
          setClashModalOpen(true);
          setSaving(false);
          return;
        }
      }

      await executeToggle(true);
    } catch (err) {
      console.error("Clash pre-check error:", err);
      await executeToggle(true);
    } finally {
      setSaving(false);
    }
  };

  const executeToggle = async (targetState: boolean) => {
    setSaving(true);
    try {
      const res = await fetch("/api/saved/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.saved);
        if (onSaveToggle) onSaveToggle(event.id, data.saved);
      }
    } catch (err) {
      console.error("Save toggle error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/75 backdrop-blur-sm animate-fade-in">
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Slide-over Drawer Panel */}
        <div className="relative w-full max-w-xl bg-slate-900/98 backdrop-blur-2xl border-l border-slate-800 shadow-2xl h-full flex flex-col z-10 animate-slide-left overflow-y-auto">
          {/* Top Bar */}
          <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-800 text-indigo-300 border border-indigo-500/30">
                {event.category}
              </span>
              <CampusVerifiedBadge size="sm" />
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-200 active:scale-90"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-6 space-y-6 flex-1">
            {/* Poster Media Box */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl group">
              <img
                src={event.posterUrl}
                alt={event.title}
                className="w-full h-auto object-cover max-h-[380px] transition-transform duration-500 ease-out-expo group-hover:scale-[1.015]"
              />
              {startingSoon && (
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-600 text-white flame-glow-badge flex items-center gap-1.5 shadow-lg">
                    <Flame className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                    <span>🔥 Starting Soon</span>
                  </span>
                </div>
              )}
            </div>

            {/* Event Title */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight leading-tight">
                {event.title}
              </h2>
              {event.summary && (
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  {event.summary}
                </p>
              )}
            </div>

            {/* Core Metadata Grid */}
            <div className="space-y-3 py-4 border-y border-slate-800 text-xs">
              <div className="flex items-start gap-3 text-slate-200">
                <Calendar className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">{countdownText}</p>
                  <p className="text-[11px] text-slate-400 font-mono">Date: {event.date}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-slate-200">
                <Clock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">{event.startTime} – {event.endTime}</p>
                  <p className="text-[11px] text-slate-400">Scheduled campus time</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-slate-200">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">{event.venue}</p>
                  <p className="text-[11px] text-slate-400">Campus Location</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-slate-200">
                <User className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">
                    {event.organizerName || (event as any).organizer?.name || "Campus Host"}
                  </p>
                  <p className="text-[11px] text-slate-400">Official Host</p>
                </div>
              </div>
            </div>

            {/* Primary Action Button: Save to Schedule */}
            <div>
              <button
                onClick={handleSaveClick}
                disabled={saving}
                className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ease-out-expo active:scale-[0.98] shadow-lg ${
                  isSaved
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/30"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-brand"
                }`}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 fill-indigo-300" />
                    <span>Saved to My Schedule (Click to Remove)</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>Save to My Schedule</span>
                  </>
                )}
              </button>
            </div>

            {/* Secondary Registration Link if available */}
            {event.registrationUrl && event.registrationUrl !== "Not specified" && (
              <div>
                <a
                  href={event.registrationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 font-medium transition-all duration-200 active:scale-[0.99] group text-xs"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-indigo-400 group-hover:rotate-6 transition-transform" />
                    <span>Official Registration Portal</span>
                  </span>
                  <span className="text-[10px] text-indigo-400 uppercase font-mono group-hover:translate-x-0.5 transition-transform">
                    Open Link →
                  </span>
                </a>
              </div>
            )}

            {/* Human Verification Stamp Notice */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-slate-300 space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Human Certified by Campus Leadership
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Extracted with AI and authenticated against original poster artwork.
              </p>
            </div>

            {/* Full Description */}
            {event.description && (
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                  About This Event
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            )}

            {/* Tags */}
            {event.tags && (
              <div className="pt-2">
                <div className="flex flex-wrap gap-1.5">
                  {event.tags.split(",").map((t: string) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-lg text-xs bg-slate-950 text-slate-400 border border-slate-800 font-mono"
                    >
                      #{t.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Deep link fallback */}
            <div className="pt-4 border-t border-slate-800/80 text-center">
              <Link
                href={`/events/${event.id}`}
                className="text-[11px] font-mono text-slate-500 hover:text-indigo-400 transition-colors"
              >
                Open dedicated permalink page ↗
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* In-drawer Clash Warning Dialog */}
      {clashData && (
        <ClashWarningModal
          isOpen={clashModalOpen}
          onClose={() => setClashModalOpen(false)}
          onConfirmSave={() => executeToggle(true)}
          conflictingEvent={clashData.conflictingEvent}
          currentEvent={{
            title: event.title,
            startTime: event.startTime,
            endTime: event.endTime,
            venue: event.venue,
            date: event.date,
          }}
          overlapStr={clashData.overlap?.formatted || "Direct Overlap"}
        />
      )}
    </>
  );
}
