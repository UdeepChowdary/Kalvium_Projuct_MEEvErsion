"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
  User,
  Sparkles,
  ArrowRight,
  Edit3,
  RefreshCw,
  ExternalLink,
  Search,
  Eye,
  Info,
} from "lucide-react";
import confetti from "canvas-confetti";
import CampusVerifiedBadge from "@/components/CampusVerifiedBadge";
import DeclineReasonModal from "@/components/DeclineReasonModal";
import { useAuth } from "@/context/AuthContext";
import { ConfidenceLevel } from "@/lib/ai-poster-analyzer";

export default function CampusManagerVerificationQueue() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Selected event for deep verification review
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableFields, setEditableFields] = useState<any>({});

  // Tab state: single unified workspace
  const [activeTab, setActiveTab] = useState<"PENDING" | "APPROVED" | "DECLINED">("PENDING");
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Decline modal state
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchPendingQueue = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/manager/pending", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.pendingEvents && json.pendingEvents.length > 0 && !selectedEvent) {
          selectEventForReview(json.pendingEvents[0]);
        }
      }
    } catch (e) {
      console.error("Queue load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!user) return;
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/manager/history", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setHistory(json.history || []);
      }
    } catch (e) {
      console.error("History load error:", e);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingQueue();
    fetchHistory();
  }, [user]);

  const selectEventForReview = (event: any) => {
    setSelectedEvent(event);
    setEditableFields({
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      venue: event.venue,
      organizerName: event.organizerName || "",
      category: event.category,
      summary: event.summary,
      description: event.description,
    });
    setIsEditing(false);
  };

  // Campus Manager Approves Event
  const handleApprove = async () => {
    if (!selectedEvent) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/manager/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          action: "APPROVE",
          corrections: isEditing ? editableFields : undefined,
        }),
      });

      if (res.ok) {
        // Trigger celebratory confetti for verification stamp!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10B981", "#6366F1", "#3B82F6"],
        });

        setSuccessToast(`✓ "${selectedEvent.title}" stamped with CAMPUS VERIFIED badge and published!`);
        setTimeout(() => setSuccessToast(null), 5000);

        setSelectedEvent(null);
        fetchPendingQueue();
        fetchHistory();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  // Campus Manager Declines Event
  const handleConfirmDecline = async (reason: string, customNotes: string) => {
    if (!selectedEvent) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/manager/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          action: "DECLINE",
          reason,
          customNotes,
        }),
      });

      if (res.ok) {
        setSuccessToast(`Event declined. Feedback logged for organizer.`);
        setTimeout(() => setSuccessToast(null), 4000);
        setSelectedEvent(null);
        fetchPendingQueue();
        fetchHistory();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  if (!user || user.role !== "CAMPUS_MANAGER") {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
          <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Campus Manager Portal</h2>
          <p className="text-xs text-slate-400 mb-6">
            Only campus leadership and verified managers have authority to approve or decline submissions.
            Please switch to "Dr. Sharma (Campus Manager)" using the top evaluation bar.
          </p>
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
          >
            Sign In with Manager Credentials
          </Link>
        </div>
      </div>
    );
  }

  const stats = data?.stats || { pending: 0, approved: 0, declined: 0, total: 0 };
  const pendingEvents = data?.pendingEvents || [];

  // Parse AI Analysis data if available
  let confidenceMap: Record<string, ConfidenceLevel> = {
    title: "HIGH",
    date: "HIGH",
    startTime: "MEDIUM",
    endTime: "LOW",
    venue: "HIGH",
    organizerName: "LOW",
  };

  if (selectedEvent?.analyses && selectedEvent.analyses[0]?.confidenceData) {
    try {
      confidenceMap = {
        ...confidenceMap,
        ...JSON.parse(selectedEvent.analyses[0].confidenceData),
      };
    } catch {
      // fallback
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Signature Pipeline Concept Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
            Official Campus Certification Studio
          </span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 shadow-sm">
            <span className="text-slate-300 font-semibold">POSTER TRUTH</span>
            <span className="text-indigo-400">→</span>
            <span className="text-indigo-300 font-semibold">AI UNDERSTANDING</span>
            <span className="text-indigo-400">→</span>
            <span className="text-amber-300 font-semibold">HUMAN VERIFICATION</span>
            <span className="text-emerald-400">→</span>
            <span className="text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
              ✓ CAMPUS VERIFIED
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
              Event Verification Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Authenticate event legitimacy against original posters before events reach student feeds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/manager/history"
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all duration-200 active:scale-95"
            >
              View Audit History →
            </Link>
            <button
              onClick={fetchPendingQueue}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all duration-200 active:scale-95"
              title="Refresh Queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-lg animate-slide-down">
          <span>{successToast}</span>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-400 hover:text-white active:scale-90 transition-transform">
            ✕
          </button>
        </div>
      )}

      {/* 3 Main Task-Focused Tabs: Pending / Approved / Declined */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <button
          onClick={() => setActiveTab("PENDING")}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 active:scale-[0.98] ${
            activeTab === "PENDING"
              ? "bg-amber-950/30 border-amber-500 shadow-glow-brand ring-2 ring-amber-500/40"
              : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-amber-400">
              Needs Review
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <p className="text-3xl sm:text-4xl font-display font-black text-amber-400 mt-2">
            {stats.pending.toString().padStart(2, "0")}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Pending verification queue</p>
        </button>

        <button
          onClick={() => {
            setActiveTab("APPROVED");
            fetchHistory();
          }}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 active:scale-[0.98] ${
            activeTab === "APPROVED"
              ? "bg-emerald-950/30 border-emerald-500 shadow-glow-verified ring-2 ring-emerald-500/40"
              : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-emerald-400">
              Campus Verified
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl sm:text-4xl font-display font-black text-emerald-400 mt-2">
            {stats.approved.toString().padStart(2, "0")}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Certified events audit</p>
        </button>

        <button
          onClick={() => {
            setActiveTab("DECLINED");
            fetchHistory();
          }}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 active:scale-[0.98] ${
            activeTab === "DECLINED"
              ? "bg-rose-950/30 border-rose-500 ring-2 ring-rose-500/40"
              : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-rose-400">
              Declined Submissions
            </span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-3xl sm:text-4xl font-display font-black text-rose-400 mt-2">
            {stats.declined.toString().padStart(2, "0")}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Declined with feedback log</p>
        </button>
      </div>

      {/* Main Verification Studio & Views */}
      {activeTab === "PENDING" ? (
        loading ? (
        <div className="py-24 text-center text-slate-400 text-sm">
          Loading verification queue...
        </div>
      ) : pendingEvents.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/50 border border-slate-800 rounded-3xl p-8 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Verification Queue is Clear</h3>
          <p className="text-xs text-slate-400 mb-4">
            All submitted campus event posters have been certified. New submissions from student organizers will appear here immediately.
          </p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
          >
            View Public Approved Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Queue List (Select an event to inspect) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                Queue ({pendingEvents.length} Pending)
              </span>
              <span className="text-[11px] text-indigo-400">Click to Inspect</span>
            </div>

            <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
              {pendingEvents.map((event: any, idx: number) => {
                const isSelected = selectedEvent?.id === event.id;
                return (
                  <div
                    key={event.id}
                    onClick={() => selectEventForReview(event)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ease-out-expo animate-slide-up stagger-${(idx % 4) + 1} ${
                      isSelected
                        ? "bg-slate-900 border-indigo-500 shadow-glow-brand ring-2 ring-indigo-500/50 scale-[1.01]"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90 hover:-translate-y-0.5"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={event.posterUrl}
                        alt={event.title}
                        className="w-14 h-14 rounded-xl object-cover bg-slate-950 shrink-0 border border-slate-800"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                          {event.category}
                        </span>
                        <h4 className="text-xs font-bold text-white truncate mb-1">
                          {event.title}
                        </h4>
                        <div className="text-[11px] text-slate-400 space-y-0.5">
                          <p>{event.date} • {event.startTime}</p>
                          <p className="truncate text-slate-300">
                            By {event.organizerName || event.organizer?.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Signature Side-By-Side Verification Studio */}
          <div className="lg:col-span-8">
            {selectedEvent ? (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
                {/* Studio Header & Certification Disclaimer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      Pending Manager Certification
                    </span>
                    <h2 className="text-xl font-display font-black text-white mt-1">
                      {selectedEvent.title}
                    </h2>
                    <p className="text-xs text-slate-400">
                      Submitted by <span className="text-white font-semibold">{selectedEvent.organizerName || selectedEvent.organizer?.name}</span> ({selectedEvent.organizer?.email})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                        isEditing
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-800 text-slate-300 hover:text-white"
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditing ? "Editing Mode Active" : "Edit Before Approving"}</span>
                    </button>
                  </div>
                </div>

                {/* Mandated Human Authority Disclaimer */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white font-semibold">Campus Trust Authority:</strong> AI only extracts optical content and does not certify event truthfulness. As Campus Manager, you are the verifying authority who certifies this event's legitimacy.
                  </span>
                </div>

                {/* Side-By-Side: ORIGINAL POSTER vs AI EXTRACTED INFORMATION */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left Column: ORIGINAL POSTER (High Prominence) */}
                  <div className="md:col-span-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-indigo-400" />
                        Original Poster Truth
                      </span>
                      <a
                        href={selectedEvent.posterUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-mono text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        Full Res <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl group relative">
                      <img
                        src={selectedEvent.posterUrl}
                        alt="Original Poster"
                        className="w-full h-auto object-cover max-h-[480px] transition-transform duration-500 ease-out-expo group-hover:scale-[1.02] will-change-transform"
                      />
                    </div>
                  </div>

                  {/* Right Column: AI EXTRACTED DETAILS & FIELD CONFIDENCES */}
                  <div className="md:col-span-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        AI Understanding & Confidence
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        Field-Level Scrutiny
                      </span>
                    </div>

                    {/* Field 1: Title */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300">Title</span>
                        {renderConfidenceBadge(confidenceMap.title)}
                      </div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editableFields.title}
                          onChange={(e) =>
                            setEditableFields({ ...editableFields, title: e.target.value })
                          }
                          className="w-full bg-slate-950 border border-indigo-500/50 rounded-xl px-3 py-1.5 text-xs text-white"
                        />
                      ) : (
                        <p className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white">
                          {selectedEvent.title}
                        </p>
                      )}
                    </div>

                    {/* Field 2: Date */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300">Date</span>
                        {renderConfidenceBadge(confidenceMap.date)}
                      </div>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editableFields.date}
                          onChange={(e) =>
                            setEditableFields({ ...editableFields, date: e.target.value })
                          }
                          className="w-full bg-slate-950 border border-indigo-500/50 rounded-xl px-3 py-1.5 text-xs text-white"
                        />
                      ) : (
                        <p className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200">
                          {selectedEvent.date}
                        </p>
                      )}
                    </div>

                    {/* Field 3: Time (Often MEDIUM/LOW confidence -> visually highlighted) */}
                    <div
                      className={`p-2.5 rounded-xl border transition ${
                        confidenceMap.startTime === "LOW" || confidenceMap.endTime === "LOW"
                          ? "bg-amber-950/20 border-amber-500/50"
                          : "bg-slate-950 border-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-300 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>Scheduled Time Window</span>
                        </span>
                        {renderConfidenceBadge(confidenceMap.startTime || "MEDIUM")}
                      </div>

                      {isEditing ? (
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <input
                            type="text"
                            value={editableFields.startTime}
                            onChange={(e) =>
                              setEditableFields({ ...editableFields, startTime: e.target.value })
                            }
                            className="bg-slate-900 border border-indigo-500/50 rounded-lg px-2 py-1 text-xs text-white"
                            placeholder="Start: 10:00 AM"
                          />
                          <input
                            type="text"
                            value={editableFields.endTime}
                            onChange={(e) =>
                              setEditableFields({ ...editableFields, endTime: e.target.value })
                            }
                            className="bg-slate-900 border border-indigo-500/50 rounded-lg px-2 py-1 text-xs text-white"
                            placeholder="End: 01:00 PM"
                          />
                        </div>
                      ) : (
                        <p className="text-xs font-mono font-bold text-white">
                          {selectedEvent.startTime} – {selectedEvent.endTime}
                        </p>
                      )}

                      {(confidenceMap.startTime !== "HIGH" || confidenceMap.endTime !== "HIGH") && (
                        <span className="text-[10px] text-amber-400/90 block mt-1">
                          ⚠ Check poster for exact duration & end-time clarification
                        </span>
                      )}
                    </div>

                    {/* Field 4: Venue */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300">Venue</span>
                        {renderConfidenceBadge(confidenceMap.venue)}
                      </div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editableFields.venue}
                          onChange={(e) =>
                            setEditableFields({ ...editableFields, venue: e.target.value })
                          }
                          className="w-full bg-slate-950 border border-indigo-500/50 rounded-xl px-3 py-1.5 text-xs text-white"
                        />
                      ) : (
                        <p className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white">
                          {selectedEvent.venue}
                        </p>
                      )}
                    </div>

                    {/* Field 5: Organizer (Uncertain -> Low Confidence Warning) */}
                    <div
                      className={`p-2.5 rounded-xl border transition ${
                        confidenceMap.organizerName === "LOW"
                          ? "bg-amber-950/20 border-amber-500/50"
                          : "bg-slate-950 border-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-300">Organizer / Host</span>
                        {renderConfidenceBadge(confidenceMap.organizerName || "LOW")}
                      </div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editableFields.organizerName}
                          onChange={(e) =>
                            setEditableFields({ ...editableFields, organizerName: e.target.value })
                          }
                          className="w-full bg-slate-900 border border-indigo-500/50 rounded-lg px-2 py-1 text-xs text-white mt-1"
                        />
                      ) : (
                        <p className="text-xs text-white font-medium">
                          {selectedEvent.organizerName || selectedEvent.organizer?.name}
                        </p>
                      )}
                      {confidenceMap.organizerName === "LOW" && (
                        <span className="text-[10px] text-amber-400 block mt-1">
                          ⚠ Needs manual verification: Confirm organizer is registered student union society
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description & Summary Section */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Generated Description (Anti-Hallucination Checked)
                  </span>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={editableFields.description}
                      onChange={(e) =>
                        setEditableFields({ ...editableFields, description: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-indigo-500/50 rounded-xl p-3 text-xs text-white"
                    />
                  ) : (
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedEvent.description}
                    </p>
                  )}
                </div>

                {/* Verification Decision Actions */}
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-400">
                    Action will be permanently recorded in Campus Verification Audit Log.
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* DECLINE BUTTON */}
                    <button
                      onClick={() => setDeclineModalOpen(true)}
                      disabled={actionLoading}
                      className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/80 transition-all duration-200 ease-out-expo active:scale-95 hover:border-rose-700"
                    >
                      Decline Event...
                    </button>

                    {/* APPROVE BUTTON */}
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-glow-verified transition-all duration-200 ease-out-expo active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>{isEditing ? "Save Edits & Approve" : "Approve Event (Stamp Verified)"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-3xl">
                <p className="text-xs text-slate-400">
                  Select a pending event from the queue on the left to begin verification.
                </p>
              </div>
            )}
          </div>
        </div>
      )) : activeTab === "APPROVED" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              Campus Certified Events ({history.filter((h) => h.action === "APPROVED").length})
            </span>
          </div>
          {historyLoading ? (
            <div className="py-20 text-center text-slate-400 text-sm">Loading certified events...</div>
          ) : history.filter((h) => h.action === "APPROVED").length === 0 ? (
            <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl max-w-xl mx-auto">
              <p className="text-sm font-bold text-white mb-1">No certified events recorded yet</p>
              <p className="text-xs text-slate-400">Approved events from the pending queue will be cataloged here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history
                .filter((h) => h.action === "APPROVED")
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 hover:border-emerald-500/60"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <img
                        src={entry.event?.posterUrl || "/images/placeholder.svg"}
                        alt={entry.event?.title || "Event"}
                        className="w-16 h-16 rounded-xl object-cover bg-slate-950 shrink-0 border border-slate-800"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-mono uppercase tracking-wider font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Approved & Certified
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                            {entry.event?.category}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white truncate">{entry.event?.title}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {entry.event?.date} • {entry.event?.venue}
                        </p>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <span className="text-[11px] font-mono text-slate-400 block">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-slate-300 font-semibold block mt-0.5">
                        Verified by {entry.manager?.name}
                      </span>
                      {entry.event?.id && (
                        <Link
                          href={`/events/${entry.event.id}`}
                          className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:underline mt-1"
                        >
                          View Live <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              Declined Submissions ({history.filter((h) => h.action === "DECLINED").length})
            </span>
          </div>
          {historyLoading ? (
            <div className="py-20 text-center text-slate-400 text-sm">Loading declined submissions...</div>
          ) : history.filter((h) => h.action === "DECLINED").length === 0 ? (
            <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl max-w-xl mx-auto">
              <p className="text-sm font-bold text-white mb-1">No declined events</p>
              <p className="text-xs text-slate-400">Submissions declined during review will appear here with rationale.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history
                .filter((h) => h.action === "DECLINED")
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-rose-500/30 flex flex-col gap-3 transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <img
                          src={entry.event?.posterUrl || "/images/placeholder.svg"}
                          alt={entry.event?.title || "Event"}
                          className="w-16 h-16 rounded-xl object-cover bg-slate-950 shrink-0 border border-slate-800 opacity-60"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[10px] font-mono uppercase tracking-wider font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Declined
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                              {entry.event?.category}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white truncate">{entry.event?.title}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {entry.event?.date} • {entry.event?.venue}
                          </p>
                        </div>
                      </div>

                      <div className="sm:text-right shrink-0">
                        <span className="text-[11px] font-mono text-slate-400 block">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-slate-300 font-semibold block mt-0.5">
                          Manager: {entry.manager?.name}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                      <span className="font-semibold text-rose-400 shrink-0">Reason:</span>
                      <span className="text-slate-300">
                        {entry.reason ? `${entry.reason} — ` : ""}
                        {entry.notes || "No additional feedback provided."}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Decline Reason Modal */}
      {selectedEvent && (
        <DeclineReasonModal
          isOpen={declineModalOpen}
          onClose={() => setDeclineModalOpen(false)}
          onConfirmDecline={handleConfirmDecline}
          eventTitle={selectedEvent.title}
        />
      )}
    </div>
  );
}

function renderConfidenceBadge(level?: ConfidenceLevel) {
  if (level === "HIGH") {
    return (
      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded">
        ✓ High
      </span>
    );
  }
  if (level === "MEDIUM") {
    return (
      <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
        ⚠ Medium
      </span>
    );
  }
  return (
    <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded">
      ⚠ Low (Scrutinize)
    </span>
  );
}
