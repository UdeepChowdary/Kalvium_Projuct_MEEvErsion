"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Filter,
} from "lucide-react";
import CampusVerifiedBadge from "@/components/CampusVerifiedBadge";
import { useAuth } from "@/context/AuthContext";

export default function ManagerAuditHistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<"ALL" | "APPROVED" | "DECLINED">("ALL");

  useEffect(() => {
    if (!user) return;
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/manager/history");
      if (res.ok) {
        const json = await res.json();
        setHistory(json.history || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "CAMPUS_MANAGER") {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center text-slate-400">
        Access restricted to Campus Managers.
      </div>
    );
  }

  const filteredHistory = history.filter((item) => {
    if (filterAction === "ALL") return true;
    return item.action === filterAction;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/dashboard/manager"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Verification Queue</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
            Immutable Audit Trail
          </span>
          <h1 className="text-3xl font-display font-black text-white tracking-tight mt-1">
            Campus Verification History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete record of manager verification actions, approval stamps, and decline rationales.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setFilterAction("ALL")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filterAction === "ALL" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            All ({history.length})
          </button>
          <button
            onClick={() => setFilterAction("APPROVED")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filterAction === "APPROVED"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilterAction("DECLINED")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filterAction === "DECLINED"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Declined
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading audit history...</div>
      ) : filteredHistory.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
          <p className="text-xs text-slate-400">No records found matching filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((entry) => (
            <div
              key={entry.id}
              className={`p-5 rounded-2xl border transition ${
                entry.action === "APPROVED"
                  ? "bg-slate-900/80 border-emerald-500/30"
                  : "bg-slate-900/80 border-rose-500/30"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <img
                    src={entry.event.posterUrl}
                    alt={entry.event.title}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-950 shrink-0 border border-slate-800"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {entry.action === "APPROVED" ? (
                        <span className="text-[10px] font-mono uppercase tracking-wider font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Approved & Certified
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono uppercase tracking-wider font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Declined
                        </span>
                      )}

                      <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {entry.event.category}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-1">{entry.event.title}</h3>
                    <p className="text-xs text-slate-400">
                      Event Date: {entry.event.date} • Venue: {entry.event.venue}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono text-slate-400 block">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-300 font-semibold mt-0.5 block">
                    Manager: {entry.manager.name}
                  </span>
                </div>
              </div>

              {/* Action Notes */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
                <span className="font-semibold text-slate-400 shrink-0">
                  {entry.action === "APPROVED" ? "Audit Log:" : "Decline Reason & Notes:"}
                </span>
                <span className="text-slate-200">
                  {entry.reason ? `${entry.reason} — ` : ""}
                  {entry.notes || "No additional notes"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
