"use client";

import React from "react";
import CreateEventStudio from "@/components/CreateEventStudio";

export default function CreateEventStudioPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
            AI Event Creation Studio
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-xs text-slate-400">Zero Manual Data Entry</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
          Create an Event with AI Poster Analysis
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload your event poster and let AI extract structured event details, evaluate confidence scores, and format content for campus verification.
        </p>
      </div>

      <CreateEventStudio />
    </div>
  );
}
