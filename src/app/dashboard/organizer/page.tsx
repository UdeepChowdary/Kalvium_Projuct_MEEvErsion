"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import CampusVerifiedBadge from "@/components/CampusVerifiedBadge";
import CreateEventStudio from "@/components/CreateEventStudio";
import { useAuth } from "@/context/AuthContext";

export default function OrganizerDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"SUBMISSIONS" | "CREATE">("SUBMISSIONS");

  const fetchOrganizerData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/organizer/events", { cache: "no-store" });
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

  useEffect(() => {
    fetchOrganizerData();
  }, [user]);

  if (!user || user.role === "STUDENT") {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-base font-bold text-white mb-2">Organizer Access Required</p>
          <p className="text-xs text-slate-400 mb-6">
            Please log in as an Organizer or switch to "Robotics Club (Organizer)" using the top demo bar.
          </p>
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const stats = data?.stats || { total: 0, pending: 0, approved: 0, declined: 0 };
  const events = data?.events || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
            Organizer Studio
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight mt-1">
            {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Submit event posters for AI extraction, monitor submissions, and track Campus Manager verification.
          </p>
        </div>

        <button
          onClick={() => setActiveTab(activeTab === "CREATE" ? "SUBMISSIONS" : "CREATE")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-glow-brand transition shrink-0 active:scale-95"
        >
          {activeTab === "CREATE" ? (
            <span>View Submissions</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>+ Create with AI</span>
            </>
          )}
        </button>
      </div>

      {/* 2 Primary Task-Focused Workspace Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-8">
        <button
          onClick={() => setActiveTab("SUBMISSIONS")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-2 ${
            activeTab === "SUBMISSIONS"
              ? "bg-indigo-600 text-white shadow-glow-brand"
              : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <span>Your Submissions</span>
          <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-mono font-bold">
            {events.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("CREATE")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-2 ${
            activeTab === "CREATE"
              ? "bg-indigo-600 text-white shadow-glow-brand"
              : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Create with AI</span>
        </button>
      </div>

      {/* Tab 1: Create with AI In-Place */}
      {activeTab === "CREATE" ? (
        <div className="animate-fade-in">
          <CreateEventStudio
            onComplete={() => {
              setActiveTab("SUBMISSIONS");
              fetchOrganizerData();
            }}
          />
        </div>
      ) : (
        /* Tab 2: Your Submissions & Quick Metrics */
        <div className="space-y-6 animate-fade-in">
          {/* Status Metrics Strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-amber-500/30 bg-amber-950/10">
              <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-semibold block mb-1">
                Pending Verification
              </span>
              <p className="text-2xl sm:text-3xl font-display font-black text-amber-400">{stats.pending}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-emerald-500/30 bg-emerald-950/10">
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold block mb-1">
                Approved & Public
              </span>
              <p className="text-2xl sm:text-3xl font-display font-black text-emerald-400">{stats.approved}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-rose-500/30 bg-rose-950/10">
              <span className="text-[11px] font-mono text-rose-400 uppercase tracking-wider font-semibold block mb-1">
                Declined
              </span>
              <p className="text-2xl sm:text-3xl font-display font-black text-rose-400">{stats.declined}</p>
            </div>
          </div>

          {/* Submissions List Header */}
          <div className="flex items-center justify-between pt-2">
            <h2 className="text-sm font-display font-extrabold uppercase tracking-wider text-slate-300">
              Submission History
            </h2>
            <button
              onClick={fetchOrganizerData}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400 text-sm">
              Loading your submissions...
            </div>
          ) : events.length === 0 ? (
            <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl p-8">
              <p className="text-sm font-bold text-white mb-2">No event submissions yet</p>
              <p className="text-xs text-slate-400 mb-6">
                Upload your promotional poster and let the AI analyzer extract structured event details.
              </p>
              <button
                onClick={() => setActiveTab("CREATE")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-glow-brand active:scale-95 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Your First Event with AI</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((ev: any) => (
                <div
                  key={ev.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <img
                        src={ev.posterUrl || "/images/placeholder.svg"}
                        alt={ev.title}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-slate-950 shrink-0 border border-slate-800"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-mono uppercase bg-slate-800 text-indigo-300 px-2 py-0.5 rounded font-bold">
                            {ev.category}
                          </span>
                          {renderStatusBadge(ev.status)}
                          {ev.status === "APPROVED" && <CampusVerifiedBadge size="sm" />}
                        </div>
                        <h3 className="text-base font-bold text-white mb-1 truncate">{ev.title}</h3>
                        <p className="text-xs text-slate-400">
                          {ev.date} • {ev.startTime} – {ev.endTime} • {ev.venue}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {ev.status === "APPROVED" && (
                        <Link
                          href={`/events/${ev.id}`}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-400 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 transition"
                        >
                          Public Page →
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Decline Feedback Banner */}
                  {ev.status === "DECLINED" && (
                    <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs text-rose-200 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-rose-400">
                        <XCircle className="w-4 h-4" />
                        <span>Declined by Campus Manager</span>
                      </div>
                      <p className="text-slate-300">
                        <span className="font-semibold text-rose-300">Reason:</span>{" "}
                        {ev.declineReason || "Event information could not be verified."}
                      </p>
                      {ev.declineCustomNotes && (
                        <p className="text-slate-400 text-[11px] pt-1 border-t border-rose-900/50">
                          Manager feedback: {ev.declineCustomNotes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function renderStatusBadge(status: string) {
  switch (status) {
    case "APPROVED":
      return (
        <span className="text-[10px] font-mono uppercase tracking-wider font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
          Approved
        </span>
      );
    case "PENDING":
      return (
        <span className="text-[10px] font-mono uppercase tracking-wider font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Pending Verification
        </span>
      );
    case "DECLINED":
      return (
        <span className="text-[10px] font-mono uppercase tracking-wider font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Declined
        </span>
      );
    default:
      return (
        <span className="text-[10px] font-mono uppercase tracking-wider font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
          Draft
        </span>
      );
  }
}
