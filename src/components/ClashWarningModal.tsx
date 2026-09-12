"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Clock, MapPin, X } from "lucide-react";

interface ClashWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSave: () => void;
  conflictingEvent: {
    title: string;
    startTime: string;
    endTime: string;
    venue?: string;
    date: string;
  };
  currentEvent: {
    title: string;
    startTime: string;
    endTime: string;
    venue?: string;
    date: string;
  };
  overlapStr: string;
}

export default function ClashWarningModal({
  isOpen,
  onClose,
  onConfirmSave,
  conflictingEvent,
  currentEvent,
  overlapStr,
}: ClashWarningModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-void-950/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="glass relative w-full max-w-lg overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-black/60 border border-flare-400/30"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-flare-500/15 text-flare-400 border border-flare-400/20">
                  <AlertTriangle size={20} />
                </span>
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-flare-400 uppercase block">
                    Schedule Conflict Detected
                  </span>
                  <h3 className="font-display text-xl font-bold text-white tracking-tight">
                    Schedule Clash Warning
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              You are about to save an event that overlaps with an item already on your personal schedule:
            </p>

            {/* Overlapping Cards */}
            <div className="mt-5 space-y-3">
              {/* Conflicting Event */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Already Saved Event
                </span>
                <p className="font-display text-sm sm:text-base font-semibold text-white mb-1.5">
                  {conflictingEvent.title}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1.5 text-flare-400 font-medium bg-flare-500/10 px-2 py-0.5 rounded-full border border-flare-400/20">
                    <Clock size={12} />
                    {conflictingEvent.startTime} – {conflictingEvent.endTime}
                  </span>
                  {conflictingEvent.venue && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-slate-500" />
                      {conflictingEvent.venue}
                    </span>
                  )}
                </div>
              </div>

              {/* Event Being Saved */}
              <div className="rounded-2xl border border-signal-500/30 bg-signal-500/10 p-4">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-signal-400 block mb-1">
                  Event You Are Saving
                </span>
                <p className="font-display text-sm sm:text-base font-semibold text-white mb-1.5">
                  {currentEvent.title}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                  <span className="flex items-center gap-1.5 text-signal-300 font-medium bg-signal-500/20 px-2 py-0.5 rounded-full border border-signal-400/30">
                    <Clock size={12} />
                    {currentEvent.startTime} – {currentEvent.endTime}
                  </span>
                  {currentEvent.venue && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin size={12} className="text-slate-500" />
                      {currentEvent.venue}
                    </span>
                  )}
                </div>
              </div>

              {/* Overlap Window Badge */}
              <div className="flex items-center justify-between rounded-xl border border-flare-400/25 bg-flare-500/10 px-4 py-2.5 text-xs">
                <span className="flex items-center gap-2 font-medium text-flare-300">
                  <span className="h-2 w-2 rounded-full bg-flare-400 animate-pulse" />
                  Direct Overlap Window:
                </span>
                <span className="font-mono font-bold text-flare-400">
                  {overlapStr}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-full px-5 py-2.5 text-xs sm:text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirmSave();
                  onClose();
                }}
                className="rounded-full bg-flare-500 hover:bg-flare-400 px-5 py-2.5 text-xs sm:text-sm font-bold text-void-950 shadow-lg shadow-flare-500/25 transition active:scale-95"
              >
                Save Anyway
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
