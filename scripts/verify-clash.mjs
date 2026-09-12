function parseTimeToMinutes(timeStr) {
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

function formatMinutesToTime(minutes) {
  const normalized = Math.max(0, Math.min(1439, minutes));
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMins = mins.toString().padStart(2, "0");
  return `${displayHours}:${displayMins} ${period}`;
}

function checkTwoEventsClash(a, b) {
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

console.log("🔍 Verifying Schedule Clash Detection Logic...\n");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

// Test 1: Exact Overlap
const eventA = {
  id: "1",
  title: "AI Workshop",
  date: "2026-09-15",
  startTime: "10:00 AM",
  endTime: "12:00 PM",
};
const eventB = {
  id: "2",
  title: "Hackathon Intro",
  date: "2026-09-15",
  startTime: "11:30 AM",
  endTime: "01:00 PM",
};

const result1 = checkTwoEventsClash(eventA, eventB);
assert(result1.hasClash === true, "Overlapping events (10:00-12:00 vs 11:30-1:00) detected as CLASH");
assert(
  result1.overlap?.formatted === "11:30 AM – 12:00 PM",
  `Correct calculated overlap window: ${result1.overlap?.formatted}`
);

// Test 2: Back-to-Back (MUST NOT CLASH)
const eventC = {
  id: "3",
  title: "Robotics Build",
  date: "2026-09-15",
  startTime: "12:00 PM",
  endTime: "01:00 PM",
};

const result2 = checkTwoEventsClash(eventA, eventC);
assert(result2.hasClash === false, "Back-to-back events (10:00-12:00 and 12:00-1:00) are NOT a clash");

// Test 3: Completely Separate Times on Same Day
const eventD = {
  id: "4",
  title: "Evening Concert",
  date: "2026-09-15",
  startTime: "05:00 PM",
  endTime: "08:00 PM",
};
const result3 = checkTwoEventsClash(eventA, eventD);
assert(result3.hasClash === false, "Separate time slots on same day are NOT a clash");

// Test 4: Different Dates
const eventE = {
  id: "5",
  title: "Next Day Talk",
  date: "2026-09-16",
  startTime: "10:30 AM",
  endTime: "11:30 AM",
};
const result4 = checkTwoEventsClash(eventA, eventE);
assert(result4.hasClash === false, "Events on different dates are NOT a clash");

// Test 5: Fully Enclosed Overlap
const eventF = {
  id: "6",
  title: "Mini Lightning Talk",
  date: "2026-09-15",
  startTime: "10:15 AM",
  endTime: "10:45 AM",
};
const result5 = checkTwoEventsClash(eventA, eventF);
assert(result5.hasClash === true, "Enclosed event detected as CLASH");
assert(
  result5.overlap?.formatted === "10:15 AM – 10:45 AM",
  `Enclosed overlap correctly matches: ${result5.overlap?.formatted}`
);

console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) process.exit(1);
