"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Clock,
  FileCheck,
  Info,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { SAMPLE_POSTERS, ConfidenceLevel } from "@/lib/ai-poster-analyzer";

const CATEGORIES = [
  "Workshop",
  "Hackathon",
  "Cultural",
  "Technical",
  "Sports",
  "Seminar",
  "Competition",
  "Fest",
];

interface CreateEventStudioProps {
  onComplete?: () => void;
}

export default function CreateEventStudio({ onComplete }: CreateEventStudioProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<"UPLOAD" | "ANALYZING" | "REVIEW">("UPLOAD");
  const [analyzingStepIndex, setAnalyzingStepIndex] = useState(0);

  // Poster Image state
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  // Extracted Event state
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    organizerName: "",
    category: "Workshop",
    summary: "",
    description: "",
    tags: "",
    registrationUrl: "",
    contactInfo: "",
  });

  const [confidences, setConfidences] = useState<Record<string, ConfidenceLevel>>({});
  const [duplicateWarning, setDuplicateWarning] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzingSteps = [
    "Reading event poster typography & imagery...",
    "Extracting calendar dates and time windows...",
    "Identifying campus venue and room numbers...",
    "Verifying organizer affiliations...",
    "Generating anti-hallucinated description & tags...",
  ];

  // Handle Drag & Drop / File Input
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPG, PNG, WebP).");
      return;
    }

    setPosterFile(file);
    setSelectedSampleId(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPosterPreview(base64);
      startAnalysis({ imageData: base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  // Handle 1-click Sample Poster selection
  const handleSelectSample = (sample: (typeof SAMPLE_POSTERS)[0]) => {
    setSelectedSampleId(sample.id);
    setPosterFile(null);
    setPosterPreview(sample.previewUrl);
    startAnalysis({ sampleId: sample.id, posterUrl: sample.previewUrl });
  };

  // Trigger AI Analysis
  const startAnalysis = async (payload: {
    sampleId?: string;
    imageData?: string;
    mimeType?: string;
    posterUrl?: string;
  }) => {
    setStep("ANALYZING");
    setAnalyzingStepIndex(0);
    setErrorMsg(null);

    const interval = setInterval(() => {
      setAnalyzingStepIndex((prev) => {
        if (prev < analyzingSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 600);

    try {
      const res = await fetch("/api/ai/analyze-poster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      clearInterval(interval);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "AI analysis failed");
      }

      const data = await res.json();
      const extracted = data.extractedData;

      setFormData({
        title: extracted.title || "",
        date: extracted.date || "",
        startTime: extracted.startTime || "",
        endTime: extracted.endTime || "",
        venue: extracted.venue || "",
        organizerName: extracted.organizerName || user?.name || "",
        category: extracted.category || "Technical",
        summary: extracted.summary || "",
        description: extracted.description || "",
        tags: Array.isArray(extracted.tags) ? extracted.tags.join(", ") : extracted.tags || "",
        registrationUrl: extracted.registrationUrl || "",
        contactInfo: extracted.contactInfo || "",
      });

      setConfidences(extracted.confidences || {});
      setDuplicateWarning(data.duplicateCheck?.hasPotentialDuplicate ? data.duplicateCheck : null);
      setStep("REVIEW");
    } catch (err: any) {
      clearInterval(interval);
      setErrorMsg(err.message || "Could not analyze poster. Please enter details manually.");
      setStep("REVIEW");
    }
  };

  // Submit for Manager Verification
  const handleSubmitForVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/organizer/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          posterUrl: posterPreview,
          confidences,
          duplicatesDetected: duplicateWarning,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      if (onComplete) {
        setStep("UPLOAD");
        setPosterPreview(null);
        setPosterFile(null);
        onComplete();
      } else {
        router.push("/dashboard/organizer");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit event. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* STAGE 1: UPLOAD POSTER */}
      {step === "UPLOAD" && (
        <div className="space-y-10 animate-fade-in">
          {/* Dropzone Container */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFile(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className="glass group relative border-2 border-dashed border-white/15 hover:border-signal-400 rounded-3xl p-10 text-center transition-all duration-300 ease-cinematic cursor-pointer overflow-hidden shadow-2xl hover:shadow-signal-500/20 active:scale-[0.995]"
          >
            {/* Radar Sweep Effect */}
            <div className="pointer-events-none absolute -inset-[100%] animate-sweep bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(111,91,255,0.15)_360deg)]" />

            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
            />

            <div className="relative z-10 w-16 h-16 rounded-2xl bg-signal-500/10 border border-signal-500/20 text-signal-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:border-signal-400/40 transition-all duration-300 ease-cinematic shadow-sm">
              <Upload className="w-8 h-8 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </div>

            <h3 className="relative z-10 text-xl font-display font-bold text-white mb-1 tracking-tight">
              Drop your event poster here
            </h3>
            <p className="relative z-10 text-sm text-slate-400 mb-4">
              or <span className="text-signal-400 font-semibold underline underline-offset-2">browse from your computer</span>
            </p>
            <p className="relative z-10 text-xs text-slate-500 font-mono">
              SUPPORTS JPG, JPEG, PNG, WEBP (UP TO 10MB)
            </p>
          </div>

          {/* Quick 1-Click Sample Posters Carousel */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-display font-extrabold uppercase tracking-wider text-white">
                  Or Test with Sample Campus Posters (1-Click AI Demo)
                </h3>
                <p className="text-xs text-slate-400">
                  Select any prepared campus poster to see real AI extraction, confidence scores, and clash scenarios.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SAMPLE_POSTERS.map((sample, idx) => (
                <div
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all duration-300 ease-out-expo hover:-translate-y-1.5 hover:shadow-card-hover active:scale-95 animate-slide-up stagger-${(idx % 4) + 1}`}
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-slate-950">
                    <img
                      src={sample.previewUrl}
                      alt={sample.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out-expo will-change-transform"
                    />
                  </div>
                  <div className="p-3.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-indigo-400 block mb-1">
                      {sample.category}
                    </span>
                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 line-clamp-1 transition-colors">
                      {sample.name}
                    </h4>
                    <span className="text-[11px] text-slate-500 group-hover:text-slate-400 block mt-1 transition-colors">
                      Click to analyze with AI →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STAGE 2: AI ANALYZING ANIMATION */}
      {step === "ANALYZING" && (
        <div className="py-12 text-center max-w-lg mx-auto animate-scale-in">
          {/* Laser Scanner Poster Preview */}
          {posterPreview ? (
            <div className="relative mx-auto w-48 aspect-[3/4] rounded-2xl overflow-hidden border border-indigo-500/50 shadow-glow-brand mb-6 bg-slate-950">
              <img
                src={posterPreview}
                alt="Scanning poster"
                className="w-full h-full object-cover opacity-85"
              />
              <div className="laser-scan-line" />
              <div className="absolute inset-0 bg-indigo-600/10 pointer-events-none" />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-slate-950/80 text-indigo-300 border border-indigo-500/30">
                AI SCANNING
              </div>
            </div>
          ) : (
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/30 animate-ping"></div>
              <div className="absolute -inset-2 rounded-full bg-indigo-500/10 animate-glow-pulse"></div>
              <div className="relative w-full h-full rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center shadow-glow-brand">
                <Sparkles className="w-10 h-10 text-indigo-400 animate-spin" />
              </div>
            </div>
          )}

          <h2 className="text-2xl font-display font-black text-white mb-2 tracking-tight">
            Analyzing Your Event Poster...
          </h2>
          <p className="text-sm font-mono text-indigo-400 mb-6 h-6 flex items-center justify-center animate-fade-in">
            {analyzingSteps[analyzingStepIndex]}
          </p>

          <div className="space-y-2.5 text-left bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-xs text-slate-300 shadow-xl">
            {analyzingSteps.map((s, idx) => (
              <div
                key={s}
                className={`flex items-center gap-2.5 transition-all duration-300 ease-out-expo ${
                  idx <= analyzingStepIndex
                    ? "opacity-100 text-slate-200 translate-x-0"
                    : "opacity-30 text-slate-600 translate-x-1"
                }`}
              >
                {idx < analyzingStepIndex ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 animate-scale-in" />
                ) : idx === analyzingStepIndex ? (
                  <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin shrink-0"></div>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-slate-800 shrink-0"></div>
                )}
                <span className={idx === analyzingStepIndex ? "font-semibold text-white" : ""}>
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STAGE 3: AI GENERATED RESULT & REVIEW */}
      {step === "REVIEW" && (
        <div className="animate-fade-in space-y-8">
          {/* Top Review Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Review AI-Generated Event Details</h3>
                <p className="text-xs text-slate-400">
                  Inspect extracted fields, make any necessary adjustments, and submit for Campus Manager approval.
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep("UPLOAD")}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Upload Different Poster</span>
            </button>
          </div>

          {/* Duplicate Event Warning Banner if detected */}
          {duplicateWarning && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-amber-300">Possible Duplicate Event Detected</p>
                <p className="text-slate-300 mt-0.5">{duplicateWarning.reason}</p>
                <p className="text-slate-400 text-[11px] mt-1">
                  You may still review and submit. The Campus Manager will also receive this duplicate advisory.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          {/* Side-By-Side Layout: Poster + Editable Form */}
          <form onSubmit={handleSubmitForVerification} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Original Poster Preview + AI Confidence Overview */}
            <div className="lg:col-span-5 space-y-6 animate-scale-in">
              <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 p-2 shadow-xl group">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2 px-2 pt-1 font-bold">
                  Original Uploaded Poster Truth
                </span>
                {posterPreview && (
                  <img
                    src={posterPreview}
                    alt="Event Poster"
                    className="w-full h-auto rounded-xl object-cover max-h-[480px] transition-transform duration-500 ease-out-expo group-hover:scale-[1.01]"
                  />
                )}
              </div>

              {/* Confidence Ratings Card */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Extraction Certainty Ratings
                  </span>
                  <span className="text-[11px] font-mono text-indigo-400 font-semibold">AI OCR ENGINE</span>
                </div>

                <div className="space-y-2 text-xs">
                  {Object.entries(confidences).map(([field, level]) => (
                    <div
                      key={field}
                      className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-none"
                    >
                      <span className="capitalize text-slate-300 font-medium">
                        {field.replace(/([A-Z])/g, " $1")}
                      </span>
                      {renderConfidenceBadge(level)}
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>
                    Confidence reflects optical clarity only. Campus Manager approval is required for authentic public listing.
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Editable Structured Form */}
            <div className="lg:col-span-7 space-y-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl animate-slide-up stagger-1">
              <h3 className="text-base font-display font-bold text-white border-b border-slate-800 pb-3">
                Event Information
              </h3>

              {/* Event Title */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Date & Times Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Date (YYYY-MM-DD) *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Start Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:00 AM"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    End Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 01:00 PM"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Venue & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Venue / Campus Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Innovation Lab 304"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Organizer Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Organizer / Society Name
                </label>
                <input
                  type="text"
                  value={formData.organizerName}
                  onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                  placeholder="e.g. Robotics & AI Society"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Summary */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  1-2 Sentence Summary (Card Teaser)
                </label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Concise summary for student discovery cards"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Full Description (Strictly based on poster) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="AI, Robotics, Hardware, Workshop"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Registration URL & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Registration Link (if any)
                  </label>
                  <input
                    type="text"
                    value={formData.registrationUrl}
                    onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                    placeholder="https://... or Not specified"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Contact Email / Phone
                  </label>
                  <input
                    type="text"
                    value={formData.contactInfo}
                    onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                    placeholder="contact@campus.edu or Not specified"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Event will be submitted in <span className="font-bold text-amber-400">Pending Verification</span> state.
                </span>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-brand transition-all duration-200 ease-out-expo active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit for Verification</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function renderConfidenceBadge(level?: ConfidenceLevel) {
  if (level === "HIGH") {
    return (
      <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded">
        ✓ High confidence
      </span>
    );
  }
  if (level === "MEDIUM") {
    return (
      <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
        ⚠ Medium confidence
      </span>
    );
  }
  return (
    <span className="text-[11px] font-mono font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded">
      ⚠ Low confidence (Check poster)
    </span>
  );
}
