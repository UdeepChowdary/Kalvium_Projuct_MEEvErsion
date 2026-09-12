/**
 * Schedule Clash Detection Engine
 * 
 * Formal collision algorithm:
 * Two events clash on the same date IF AND ONLY IF:
 *   eventA.start < eventB.end AND eventB.start < eventA.end
 * 
 * Back-to-back events (e.g. 10:00 AM - 12:00 PM and 12:00 PM - 1:00 PM) DO NOT clash.
 */

export interface TimeSlot {
  id?: string;
  title: string;
  date: string;       // YYYY-MM-DD
  startTime: string;  // e.g. "10:00 AM" or "10:00"
  endTime: string;    // e.g. "12:00 PM" or "12:00"
  venue?: string;
}

export interface ClashResult {
  hasClash: boolean;
  conflictingEvent?: TimeSlot;
  overlap?: {
    startMinutes: number;
    endMinutes: number;
    formatted: string;
    durationMinutes: number;
  };
}

/**
 * Parses time strings in 12-hour or 24-hour formats into minutes from midnight (0 - 1439).
 * Examples:
 *  "10:00 AM" -> 600
 *  "12:00 PM" -> 720
 *  "01:30 PM" -> 810
 *  "14:00"    -> 840
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().toUpperCase();

  const is12Hour = clean.includes("AM") || clean.includes("PM");

  if (is12Hour) {
    const isPM = clean.includes("PM");
    const parts = clean.replace(/AM|PM/g, "").trim().split(":");
    let hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;

    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;

    return hours * 60 + minutes;
  } else {
    const parts = clean.split(":");
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    return hours * 60 + minutes;
  }
}

/**
 * Formats minutes from midnight back to readable 12-hour format ("10:00 AM").
 */
export function formatMinutesToTime(minutes: number): string {
  const normalized = Math.max(0, Math.min(1439, minutes));
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMins = mins.toString().padStart(2, "0");
  return `${displayHours}:${displayMins} ${period}`;
}

/**
 * Checks if two events clash.
 */
export function checkTwoEventsClash(a: TimeSlot, b: TimeSlot): ClashResult {
  // Must be on the exact same date
  if (a.date !== b.date) {
    return { hasClash: false };
  }

  const startA = parseTimeToMinutes(a.startTime);
  const endA = parseTimeToMinutes(a.endTime);

  const startB = parseTimeToMinutes(b.startTime);
  const endB = parseTimeToMinutes(b.endTime);

  // Exact collision formula:
  // startA < endB AND startB < endA
  const overlaps = startA < endB && startB < endA;

  if (!overlaps) {
    return { hasClash: false };
  }

  // Calculate the exact overlap window
  const overlapStart = Math.max(startA, startB);
  const overlapEnd = Math.min(endA, endB);
  const duration = overlapEnd - overlapStart;

  return {
    hasClash: true,
    conflictingEvent: b,
    overlap: {
      startMinutes: overlapStart,
      endMinutes: overlapEnd,
      formatted: `${formatMinutesToTime(overlapStart)} – ${formatMinutesToTime(overlapEnd)}`,
      durationMinutes: duration,
    },
  };
}

/**
 * Checks if a target event clashes with ANY already-saved event in a list.
 */
export function findClashInList(target: TimeSlot, existingList: TimeSlot[]): ClashResult {
  for (const existing of existingList) {
    if (existing.id && target.id && existing.id === target.id) continue;
    const clash = checkTwoEventsClash(target, existing);
    if (clash.hasClash) {
      return clash;
    }
  }
  return { hasClash: false };
}

/**
 * Finds all clashes among a list of events (e.g. for student dashboard "Schedule Conflicts" count).
 */
export function findAllClashesInList(events: TimeSlot[]): Array<{ eventA: TimeSlot; eventB: TimeSlot; overlapStr: string }> {
  const clashes: Array<{ eventA: TimeSlot; eventB: TimeSlot; overlapStr: string }> = [];

  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const clash = checkTwoEventsClash(events[i], events[j]);
      if (clash.hasClash && clash.overlap) {
        clashes.push({
          eventA: events[i],
          eventB: events[j],
          overlapStr: clash.overlap.formatted,
        });
      }
    }
  }

  return clashes;
}
