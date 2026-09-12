"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import EventCard, { EventCardData } from "@/components/EventCard";
import CampusVerifiedBadge from "@/components/CampusVerifiedBadge";
import EventDetailDrawer from "@/components/EventDetailDrawer";
import StaggerGrid from "@/components/StaggerGrid";
import { useAuth } from "@/context/AuthContext";

const CATEGORIES = [
  "ALL",
  "Workshop",
  "Hackathon",
  "Cultural",
  "Technical",
  "Sports",
  "Seminar",
  "Competition",
  "Fest",
];

const DATE_FILTERS = [
  { id: "ALL", label: "All Upcoming" },
  { id: "TODAY", label: "Today" },
  { id: "TOMORROW", label: "Tomorrow" },
  { id: "THIS_WEEK", label: "This Week" },
];

export default function EventsExplorePage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedDateFilter, setSelectedDateFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("soonest");
  const [savedEventIds, setSavedEventIds] = useState<Set<string>>(new Set());
  const [selectedEventForDrawer, setSelectedEventForDrawer] = useState<EventCardData | null>(null);

  // Fetch student's saved event IDs to reflect bookmark state
  const fetchSavedState = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/saved");
      if (res.ok) {
        const data = await res.json();
        const ids = new Set<string>((data.events || []).map((e: any) => e.id));
        setSavedEventIds(ids);
      }
    } catch {
      // ignore
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (selectedCategory && selectedCategory !== "ALL") params.set("category", selectedCategory);
      if (selectedDateFilter && selectedDateFilter !== "ALL") params.set("dateFilter", selectedDateFilter);
      if (sortBy) params.set("sortBy", sortBy);

      const res = await fetch(`/api/events?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedState();
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedDateFilter, sortBy]);

  const handleSaveToggle = (eventId: string, isSaved: boolean) => {
    setSavedEventIds((prev) => {
      const updated = new Set(prev);
      if (isSaved) updated.add(eventId);
      else updated.delete(eventId);
      return updated;
    });
    setSelectedEventForDrawer((prev) =>
      prev && prev.id === eventId ? { ...prev, isSaved } : prev
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-signal-600 dark:text-signal-400 font-semibold bg-signal-500/10 px-3 py-1 rounded-full border border-signal-500/20">
              Campus Discovery
            </span>
            <CampusVerifiedBadge size="sm" animate />
          </div>
          <h1 className="font-display text-display-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Everything verified, this semester.
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 mt-2 max-w-xl">
            Every listed event is authenticated by campus staff against original organizer posters.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="glass flex items-center gap-2.5 text-xs font-mono text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-2xl self-start md:self-auto border border-slate-200 dark:border-white/10 shadow-xs">
          <span className="text-slate-400 dark:text-slate-500">SHOWING:</span>
          <span className="font-bold text-slate-900 dark:text-white font-display text-sm">{events.length}</span>
          <span className="text-verified-500 dark:text-verified-400 font-semibold">APPROVED EVENTS</span>
        </div>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="glass rounded-3xl p-5 sm:p-6 mb-10 space-y-5 border border-slate-200 dark:border-white/10 shadow-sm">
        {/* Search input and Sort dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full flex items-center gap-3 bg-slate-100 dark:bg-void-950/60 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 focus-within:border-signal-500/60 transition">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event title, organizer, venue, or keywords..."
              className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <SlidersHorizontal size={16} className="text-slate-400 shrink-0 hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto bg-slate-100 dark:bg-void-950/60 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-signal-500/60 transition"
            >
              <option value="soonest">Sort: Soonest First</option>
              <option value="latest">Sort: Furthest Date</option>
              <option value="recently_added">Sort: Recently Added</option>
            </select>
          </div>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase tracking-wider shrink-0 mr-2">
            Timeline:
          </span>
          {DATE_FILTERS.map((df) => {
            const active = selectedDateFilter === df.id;
            return (
              <button
                key={df.id}
                onClick={() => setSelectedDateFilter(df.id)}
                className={`relative px-4 py-1.5 rounded-full font-medium transition-all duration-200 active:scale-95 whitespace-nowrap ${
                  active
                    ? "bg-signal-500 text-white shadow-lg shadow-signal-500/25 font-semibold"
                    : "bg-slate-100 dark:bg-void-950/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/5"
                }`}
              >
                {df.label}
              </button>
            );
          })}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase tracking-wider shrink-0 mr-2">
            Category:
          </span>
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`relative px-3.5 py-1.5 rounded-full font-medium transition-all duration-200 active:scale-95 whitespace-nowrap ${
                  active
                    ? "bg-slate-900 dark:bg-white text-white dark:text-void-950 font-bold shadow-md"
                    : "bg-slate-100 dark:bg-void-950/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/5"
                }`}
              >
                {cat === "ALL" ? "All Categories" : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="glass rounded-2xl overflow-hidden flex flex-col h-[380px] animate-pulse"
            >
              <div className="h-44 w-full bg-void-900 skeleton-shimmer" />
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="h-4 w-24 bg-void-800 rounded-md skeleton-shimmer" />
                  <div className="h-6 w-5/6 bg-void-800 rounded-md skeleton-shimmer" />
                  <div className="h-3.5 w-full bg-void-800/60 rounded-md skeleton-shimmer" />
                </div>
                <div className="space-y-2 pt-3 border-t border-white/5">
                  <div className="h-4 w-1/2 bg-void-800/60 rounded-md skeleton-shimmer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="glass py-16 text-center rounded-3xl p-8 max-w-xl mx-auto border border-white/10 animate-fade-in">
          <p className="font-display text-lg font-bold text-white mb-2">No verified events found</p>
          <p className="text-sm text-slate-400 mb-6">
            Try adjusting your search query, timeline filters, or category.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
              setSelectedDateFilter("ALL");
            }}
            className="rounded-full bg-signal-500 hover:bg-signal-400 text-white text-xs font-semibold px-5 py-2.5 transition active:scale-95"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, idx) => (
            <EventCard
              key={event.id}
              index={idx}
              event={{
                ...event,
                isSaved: savedEventIds.has(event.id),
              }}
              onSaveToggle={handleSaveToggle}
              onSelectEvent={(ev) =>
                setSelectedEventForDrawer({
                  ...ev,
                  isSaved: savedEventIds.has(ev.id),
                })
              }
            />
          ))}
        </div>
      )}

      {/* Slide-over Event Details Drawer */}
      <EventDetailDrawer
        event={selectedEventForDrawer}
        isOpen={Boolean(selectedEventForDrawer)}
        onClose={() => setSelectedEventForDrawer(null)}
        onSaveToggle={handleSaveToggle}
      />
    </div>
  );
}
