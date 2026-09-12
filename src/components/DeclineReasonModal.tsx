"use client";

import React, { useState } from "react";
import { XCircle, X } from "lucide-react";

interface DeclineReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDecline: (reason: string, customNotes: string) => void;
  eventTitle: string;
}

const PRESET_REASONS = [
  "Information doesn't match poster",
  "Event cannot be verified",
  "Invalid date",
  "Invalid time",
  "Invalid venue",
  "Duplicate event",
  "Unauthorized organizer",
  "Other",
];

export default function DeclineReasonModal({
  isOpen,
  onClose,
  onConfirmDecline,
  eventTitle,
}: DeclineReasonModalProps) {
  const [selectedReason, setSelectedReason] = useState(PRESET_REASONS[0]);
  const [customNotes, setCustomNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onConfirmDecline(selectedReason, customNotes);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl p-6 text-white animate-scale-in">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-rose-400 font-bold">
                Manager Verification
              </span>
              <h3 className="text-xl font-display font-bold text-white">Decline Event Submission</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all duration-200 active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 mb-4">
          Declining <span className="font-semibold text-white">"{eventTitle}"</span>. The organizer will receive your feedback and the event will remain private.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Why are you declining this event?
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {PRESET_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all duration-200 active:scale-[0.99] ${
                    selectedReason === reason
                      ? "bg-rose-950/40 border-rose-500/50 text-white font-medium shadow-sm"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <input
                    type="radio"
                    name="declineReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-rose-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Specific Instructions / Notes for Organizer:
            </label>
            <textarea
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. The venue stated on the poster does not match student union bookings for this date. Please attach revised poster."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-all duration-200"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200 active:scale-95"
            >
              Back to Queue
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-all duration-200 ease-out-expo active:scale-95 disabled:opacity-50"
            >
              {submitting ? "Declining..." : "Confirm Decline"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
