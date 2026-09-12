"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ArrowLeft,
  ExternalLink,
  Mail,
  Bookmark,
  BookmarkCheck,
  Flame,
  ShieldCheck,
} from "lucide-react";
import CampusVerifiedBadge from "@/components/CampusVerifiedBadge";
import ClashWarningModal from "@/components/ClashWarningModal";
import MagneticButton from "@/components/MagneticButton";
import { useAuth } from "@/context/AuthContext";
import { isStartingSoon, getHumanCountdown } from "@/lib/time";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params?.id as string;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clashModalOpen, setClashModalOpen] = useState(false);
  const [clashData, setClashData] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    fetchEvent();
    checkIfSaved();
  }, [id, user]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Event not found or access denied.");
      } else {
        const data = await res.json();
        setEvent(data.event);
      }
    } catch (e: any) {
      setError(e.message || "Failed to load event.");
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    if (!user || !id) return;
    try {
      const res = await fetch("/api/saved");
      if (res.ok) {
        const data = await res.json();
        const found = (data.events || []).some((e: any) => e.id === id);
        setIsSaved(found);
      }
    } catch {
      // ignore
    }
  };

  const handleSaveToggle = async () => {
    if (!user) {
      alert("Please sign in or select a demo role in the top bar to save events.");
      return;
    }

    if (isSaved) {
      executeSave(false);
      return;
    }

    // Pre-check for clash
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

      await executeSave(true);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const executeSave = async (targetState: boolean) => {
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
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass h-[50vh] rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="glass p-8 rounded-3xl border border-white/10 shadow-2xl">
          <p className="font-display text-lg font-bold text-white mb-2">Event Not Found</p>
          <p className="text-sm text-slate-400 mb-6">{error || "This event could not be found."}</p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-signal-500 text-white text-xs font-semibold active:scale-95 transition"
          >
            <ArrowLeft size={16} />
            <span>Back to Discovery</span>
          </Link>
        </div>
      </div>
    );
  }

  const startingSoon = isStartingSoon(event.date, event.startTime);
  const countdown = getHumanCountdown(event.date, event.startTime);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button */}
      <Link
        href="/events"
        className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-8 transition duration-200"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        <span>Back to Events</span>
      </Link>

      {/* Cinematic Poster Hero */}
      <motion.div
        initial={{ clipPath: "inset(0 0 100% 0)" }}
        animate={{ clipPath: "inset(0 0 0% 0)" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl bg-void-900 border border-white/10 shadow-2xl"
      >
        <img
          src={event.posterUrl}
          alt={event.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-void-950/30 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="rounded-full bg-void-950/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur border border-white/10">
            {event.category}
          </span>
          {event.status === "APPROVED" && <CampusVerifiedBadge animate />}
        </div>
      </motion.div>

      {/* Main Details */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } } }}
        className="mt-8 space-y-8"
      >
        {/* Title and Save Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div>
            {startingSoon && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-flare-500/10 px-3 py-1 text-xs font-bold text-flare-400 border border-flare-400/25 mb-3">
                <Flame size={14} className="animate-pulse" />
                <span>Starting soon ({countdown})</span>
              </span>
            )}
            <h1 className="font-display text-display-lg font-bold text-white tracking-tight leading-tight">
              {event.title}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Organized by <span className="text-white font-medium">{event.organizerName || event.organizer?.name || "Campus Club"}</span>
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={handleSaveToggle}
              disabled={saving}
              className={`rounded-full px-6 py-3 text-sm font-semibold flex items-center gap-2 transition active:scale-95 shadow-lg ${
                isSaved
                  ? "bg-signal-500 text-white shadow-signal-500/25 hover:bg-signal-600"
                  : "bg-white text-void-950 hover:bg-slate-200"
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck size={16} className="fill-white" />
                  <span>Saved to schedule</span>
                </>
              ) : (
                <>
                  <Bookmark size={16} />
                  <span>Save to schedule</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-4 border border-white/10">
            <span className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
              <Calendar size={14} className="text-flare-400" />
              Date
            </span>
            <p className="font-display font-semibold text-white">{event.date}</p>
            <p className="text-xs text-slate-400 mt-0.5">{countdown}</p>
          </div>

          <div className="glass rounded-2xl p-4 border border-white/10">
            <span className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
              <Clock size={14} className="text-signal-400" />
              Time Window
            </span>
            <p className="font-display font-semibold text-white">{event.startTime} – {event.endTime}</p>
            <p className="text-xs text-slate-400 mt-0.5">Clash protected</p>
          </div>

          <div className="glass rounded-2xl p-4 border border-white/10">
            <span className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
              <MapPin size={14} className="text-verified-400" />
              Campus Venue
            </span>
            <p className="font-display font-semibold text-white truncate">{event.venue}</p>
            <p className="text-xs text-slate-400 mt-0.5">On campus</p>
          </div>
        </div>

        {/* Summary & Description */}
        <div className="glass rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10">
          <div>
            <h2 className="font-display text-lg font-bold text-white mb-2">About this event</h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              {event.description || event.summary}
            </p>
          </div>

          {event.summary && event.summary !== event.description && (
            <div className="rounded-2xl bg-void-950/40 p-4 border border-white/5">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                AI Structured Summary
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {event.summary}
              </p>
            </div>
          )}

          {/* Additional details: tags, contact, registration */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/5 text-xs text-slate-400">
            {event.tags && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-slate-500 uppercase">Tags:</span>
                {event.tags.split(",").map((t: string) => (
                  <span key={t} className="rounded-full bg-white/5 px-2.5 py-0.5 text-slate-300 border border-white/5">
                    {t.trim()}
                  </span>
                ))}
              </div>
            )}

            {event.registrationUrl && (
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-signal-400 hover:text-signal-300"
              >
                <span>External Registration</span>
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </motion.div>

      {/* Clash Warning Dialog */}
      {clashData && (
        <ClashWarningModal
          isOpen={clashModalOpen}
          onClose={() => setClashModalOpen(false)}
          onConfirmSave={() => executeSave(true)}
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
    </div>
  );
}
