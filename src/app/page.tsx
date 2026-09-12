"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ScanLine, ShieldCheck, UploadCloud, Zap, Sparkles } from "lucide-react";
import MagneticButton from "@/components/MagneticButton";
import CountUp from "@/components/CountUp";
import StaggerGrid from "@/components/StaggerGrid";
import CampusVerifiedBadge from "@/components/CampusVerifiedBadge";
import TiltCard from "@/components/TiltCard";

const headlineLines = ["Find what's", "actually happening", "on campus."];

const pipeline = [
  {
    icon: UploadCloud,
    title: "An organizer uploads a poster",
    detail: "No forms to fill in twice — the flyer they already made is the input.",
  },
  {
    icon: ScanLine,
    title: "AI reads the details",
    detail: "Time, venue, and category are extracted automatically with field-level confidence.",
  },
  {
    icon: ShieldCheck,
    title: "Campus staff verify it",
    detail: "A real person on the manager team checks the AI's read before anything goes live.",
  },
  {
    icon: Zap,
    title: "It lands on your schedule",
    detail: "Clash detection checks it against what you've already saved, instantly.",
  },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });

  const headlineScale = useTransform(scrollYProgress, [0, 1], [1, 0.88]);
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, -45]);
  const cardsY = useTransform(scrollYProgress, [0, 1], [0, 90]);

  return (
    <div className="relative overflow-hidden">
      {/* ---------------------------------------------------------------- */}
      {/* Hero Section (Cinematic Scroll-Driven Parallax)                  */}
      {/* ---------------------------------------------------------------- */}
      <section ref={heroRef} className="relative overflow-hidden px-6 pt-6 sm:pt-10 pb-16 sm:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 items-center">
          <motion.div style={{ scale: headlineScale, opacity: headlineOpacity, y: headlineY }}>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 px-4 py-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 backdrop-blur-md shadow-xs"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-verified-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-verified-400"></span>
              </span>
              <span className="font-semibold text-verified-500 dark:text-verified-400">Autumn 2026 semester</span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span>verified by AI and campus staff</span>
            </motion.p>

            <h1 className="font-display text-[clamp(2.5rem,5.2vw,4.5rem)] font-bold text-slate-900 dark:text-white tracking-tight leading-[1.02]">
              {headlineLines.map((line, i) => (
                <motion.span
                  key={line}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className="block"
                >
                  {line}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="mt-6 max-w-md text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal"
            >
              Every listing is parsed by AI, certified by campus leadership, and matched against your
              personal schedule before it reaches you — so what you save is worth showing up to.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.75 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <MagneticButton href="/events" icon={<ArrowRight size={16} />}>
                Explore events
              </MagneticButton>
              <MagneticButton href="/events/create" variant="outline">
                Post an event
              </MagneticButton>
            </motion.div>
          </motion.div>

          {/* Floating Hero Preview Showcase (Enriched with poster imagery & clash shield) */}
          <motion.div style={{ y: cardsY }} className="relative hidden lg:block h-[440px]">
            {/* Ambient Radial Spotlight Glow */}
            <div className="absolute -inset-10 bg-gradient-to-tr from-signal-500/20 via-verified-500/15 to-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Card 1: Robotics Workshop */}
            <PreviewCard
              className="absolute right-0 top-0 w-84 animate-drift"
              category="Workshop"
              title="AI & Autonomous Robotics Workshop"
              when="Today · 10:00 AM"
              where="Innovation Lab (Room 304)"
              image="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&auto=format&fit=crop&q=80"
              delay={0.5}
            />

            {/* Card 2: Campus Music Fest */}
            <PreviewCard
              className="absolute right-12 top-48 w-84 [animation-delay:1.5s] animate-drift"
              category="Cultural"
              title="Harmony 2026: Campus Music Fest"
              when="Tomorrow · 5:00 PM"
              where="Main Amphitheatre"
              image="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80"
              delay={0.7}
            />

            {/* Floating Live Clash Shield Pill */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="glass absolute bottom-2 left-0 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-xl border border-verified-400/40 bg-white/95 dark:bg-void-900/90 backdrop-blur-md"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-verified-500/20 text-verified-500 border border-verified-500/30">
                <Zap size={18} className="fill-verified-500" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-verified-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-verified-400"></span>
                  </span>
                  <p className="font-display text-xs font-bold text-slate-900 dark:text-white">Clash Shield Active</p>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">0 schedule conflicts detected</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Pipeline Sequence                                                */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-display-lg font-bold text-slate-900 dark:text-white tracking-tight"
          >
            From poster to verified event.
          </motion.h2>

          <StaggerGrid className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pipeline.map((step, i) => (
              <motion.div
                key={step.title}
                variants={{
                  hidden: { opacity: 0, y: 28 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
                }}
                className="glass rounded-3xl p-6 transition-all duration-300 hover:border-indigo-400/30 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-signal-500/15 text-signal-500 dark:text-signal-400 border border-signal-500/20">
                    <step.icon size={20} />
                  </span>
                  <span className="font-display text-2xl font-bold text-slate-400 dark:text-slate-600">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-5 font-display text-base font-bold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{step.detail}</p>
              </motion.div>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Animated Stats Section                                           */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative px-6 py-14 sm:px-10">
        <div className="glass mx-auto grid max-w-5xl grid-cols-2 gap-8 rounded-3xl p-8 sm:p-12 sm:grid-cols-4 border border-slate-200 dark:border-white/10 shadow-sm">
          <Stat value={1200} suffix="+" label="Verified events" />
          <Stat value={38} suffix="" label="Clubs posting weekly" />
          <Stat value={94} suffix="%" label="AI extraction accuracy" />
          <Stat value={0} suffix="" label="Double-bookings, since launch" />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Trust Callout                                                    */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative px-6 py-14 sm:px-10 border-t border-slate-200 dark:border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <CampusVerifiedBadge size="lg" animate />
            <p className="max-w-md text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
              AI makes event creation faster. A human check makes it trustworthy. Never miss what matters on campus.
            </p>
          </div>
          <MagneticButton href="/events">
            Start Exploring
          </MagneticButton>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl tracking-tight">
        <CountUp to={value} suffix={suffix} />
      </p>
      <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
    </div>
  );
}

function PreviewCard({
  className,
  category,
  title,
  when,
  where,
  image,
  delay,
}: {
  className: string;
  category: string;
  title: string;
  when: string;
  where: string;
  image?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`glass rounded-3xl p-4 shadow-xl border border-slate-200 dark:border-white/10 ${className}`}
    >
      <div className="flex items-center gap-3">
        {image && (
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-black/10 dark:border-white/10 shadow-sm">
            <img src={image} alt={title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="rounded-full bg-signal-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-signal-600 dark:text-signal-400 border border-signal-500/20">
              {category}
            </span>
            <CampusVerifiedBadge size="sm" />
          </div>
          <h4 className="font-display text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug truncate">
            {title}
          </h4>
          <p className="text-[11px] font-medium text-flare-500 dark:text-flare-400 mt-0.5">{when}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{where}</p>
        </div>
      </div>
    </motion.div>
  );
}
