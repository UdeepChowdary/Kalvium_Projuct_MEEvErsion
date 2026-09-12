"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, Bookmark, BookmarkCheck, ArrowUpRight, Flame } from "lucide-react";
import CampusVerifiedBadge from "./CampusVerifiedBadge";
import ClashWarningModal from "./ClashWarningModal";
import TiltCard from "./TiltCard";
import { useAuth } from "@/context/AuthContext";
import { isStartingSoon, getHumanCountdown } from "@/lib/time";

export interface EventCardData {
  id: string;
  title: string;
  summary: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  organizerName?: string | null;
  posterUrl: string;
  category: string;
  status: string;
  isSaved?: boolean;
  description?: string;
  tags?: string;
  registrationUrl?: string | null;
  contactInfo?: string | null;
  organizer?: {
    name: string;
    avatar?: string | null;
  };
}

interface EventCardProps {
  event: EventCardData;
  onSaveToggle?: (eventId: string, saved: boolean) => void;
  onSelectEvent?: (event: EventCardData) => void;
  index?: number;
}

const categoryGlow: Record<string, string> = {
  Workshop: "group-hover:shadow-signal-500/25",
  Hackathon: "group-hover:shadow-signal-500/25",
  Cultural: "group-hover:shadow-flare-500/25",
  Technical: "group-hover:shadow-signal-500/25",
  Sports: "group-hover:shadow-verified-500/25",
  Seminar: "group-hover:shadow-signal-500/25",
  Competition: "group-hover:shadow-flare-500/25",
  Fest: "group-hover:shadow-flare-500/25",
};

export default function EventCard({
  event,
  onSaveToggle,
  onSelectEvent,
  index = 0,
}: EventCardProps) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(event.isSaved || false);
  const [saving, setSaving] = useState(false);
  const [clashModalOpen, setClashModalOpen] = useState(false);
  const [clashData, setClashData] = useState<any>(null);

  const startingSoon = isStartingSoon(event.date, event.startTime);
  const countdownText = getHumanCountdown(event.date, event.startTime);

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert("Please sign in or select a demo role in the top bar to save events.");
      return;
    }

    if (isSaved) {
      executeToggle(false);
      return;
    }

    // Pre-check for clash before saving
    setSaving(true);
    try {
      const clashRes = await fetch("/api/saved/check-clash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event.id }),
      });

      if (clashRes.ok) {
        const data = await clashRes.json();
        if (data.hasClash && data.conflictingEvent) {
          setClashData(data);
          setClashModalOpen(true);
          setSaving(false);
          return;
        }
      }

      await executeToggle(true);
    } catch (err) {
      console.error("Save error:", err);
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

  const glowClass = categoryGlow[event.category] || "group-hover:shadow-signal-500/20";

  return (
    <>
      <TiltCard maxTilt={4} className="h-full">
        <div
          className={`group glass relative flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300 ease-cinematic group-hover:shadow-2xl hover:border-white/20 ${glowClass}`}
        >
          {/* Poster Box */}
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-void-900">
            <img
              src={event.posterUrl}
              alt={event.title}
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-cinematic group-hover:scale-105 will-change-transform"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-void-950/30 to-transparent" />

            {/* Category & Status Pills */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap z-10">
              <span className="rounded-full bg-void-950/80 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur border border-white/10 shadow-sm">
                {event.category}
              </span>

              {startingSoon && (
                <span className="rounded-full bg-flare-500/90 px-2.5 py-0.5 text-[10px] font-bold text-void-950 flex items-center gap-1 backdrop-blur shadow-sm">
                  <Flame size={12} className="text-void-950 fill-void-950 animate-pulse" />
                  <span>Starting Soon</span>
                </span>
              )}
            </div>

            {/* Quick Bookmark Save Button */}
            <button
              onClick={handleSaveClick}
              disabled={saving}
              className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur transition-all duration-200 active:scale-90 hover:scale-105 z-10 ${
                isSaved
                  ? "bg-signal-500 text-white shadow-lg shadow-signal-500/30"
                  : "bg-void-950/70 text-slate-300 hover:text-white hover:bg-void-900 border border-white/10"
              }`}
              title={isSaved ? "Remove from Schedule" : "Save to Schedule"}
            >
              {isSaved ? (
                <BookmarkCheck size={16} className="fill-white" />
              ) : (
                <Bookmark size={16} />
              )}
            </button>

            {/* Verified Badge on Poster */}
            {event.status === "APPROVED" && (
              <div className="absolute bottom-3 left-3 z-10">
                <CampusVerifiedBadge size="sm" />
              </div>
            )}
          </div>

          {/* Body */}
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              {onSelectEvent ? (
                <button
                  type="button"
                  onClick={() => onSelectEvent(event)}
                  className="text-left w-full focus:outline-none"
                >
                  <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug group-hover:text-signal-600 dark:group-hover:text-signal-300 transition-colors duration-200 line-clamp-1 mb-2">
                    {event.title}
                  </h3>
                </button>
              ) : (
                <Link href={`/events/${event.id}`}>
                  <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug group-hover:text-signal-600 dark:group-hover:text-signal-300 transition-colors duration-200 line-clamp-1 mb-2">
                    {event.title}
                  </h3>
                </Link>
              )}

              {/* Metadata */}
              <div className="space-y-1.5 mb-3 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                  <Calendar size={13} className="text-flare-500 dark:text-flare-400 shrink-0" />
                  <span>{countdownText}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-slate-400 dark:text-slate-500 shrink-0" />
                  <span>{event.startTime} – {event.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="truncate">{event.venue}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                {event.summary}
              </p>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs">
              <div className="truncate max-w-[170px]">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase tracking-wider font-semibold">Organized by</span>
                <span className="text-slate-700 dark:text-slate-300 text-xs font-medium truncate block group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {event.organizerName || event.organizer?.name || "Campus Club"}
                </span>
              </div>

              {onSelectEvent ? (
                <button
                  type="button"
                  onClick={() => onSelectEvent(event)}
                  className="inline-flex items-center gap-1 font-semibold text-signal-600 dark:text-signal-400 hover:text-signal-500 dark:hover:text-signal-300 py-1 px-2.5 rounded-lg hover:bg-signal-500/10 active:scale-95 transition"
                >
                  <span>Details</span>
                  <ArrowUpRight size={14} />
                </button>
              ) : (
                <Link
                  href={`/events/${event.id}`}
                  className="inline-flex items-center gap-1 font-semibold text-signal-600 dark:text-signal-400 hover:text-signal-500 dark:hover:text-signal-300 py-1 px-2.5 rounded-lg hover:bg-signal-500/10 active:scale-95 transition"
                >
                  <span>Details</span>
                  <ArrowUpRight size={14} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </TiltCard>

      {/* Clash Warning Dialog */}
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
