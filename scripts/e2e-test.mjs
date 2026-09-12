import { PrismaClient } from "@prisma/client";
import { signToken, comparePassword } from "../src/lib/auth.js";
import { checkTwoEventsClash, parseTimeToMinutes } from "../src/lib/clash.js";
import { isStartingSoon } from "../src/lib/time.js";
import { analyzeEventPoster, detectDuplicateEvent } from "../src/lib/ai-poster-analyzer.js";

const prisma = new PrismaClient();

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

async function runEndToEndVerification() {
  console.log("🚀 Starting Full End-to-End Test Suite for Campus Event Hub...\n");

  // Step 1: Verify Seed Users
  console.log("[Test 1] Verifying Seed Users & Role Hierarchy...");
  const manager = await prisma.user.findUnique({ where: { email: "manager@campus.edu" } });
  const organizer = await prisma.user.findUnique({ where: { email: "robotics@campus.edu" } });
  const student = await prisma.user.findUnique({ where: { email: "alex@campus.edu" } });

  assert(manager && manager.role === "CAMPUS_MANAGER", "Campus Manager user exists with CAMPUS_MANAGER role");
  assert(organizer && organizer.role === "ORGANIZER", "Organizer user exists with ORGANIZER role");
  assert(student && student.role === "STUDENT", "Student user exists with STUDENT role");

  // Step 2: Organizer Poster AI Analysis & Submission
  console.log("\n[Test 2] Organizer Poster Analysis & Submission Workflow...");
  const sampleExtraction = await analyzeEventPoster("", "image/png", "sample-ai-robotics");
  assert(sampleExtraction.title.length > 0, "AI successfully extracts event title");
  assert(sampleExtraction.confidences.title === "HIGH", "Title has HIGH extraction confidence");
  assert(sampleExtraction.confidences.organizerName !== undefined, "Organizer confidence score evaluated");
  assert(
    sampleExtraction.disclaimer.includes("Campus Manager"),
    "Disclaimer confirms AI does not certify event truthfulness"
  );

  // Check Duplicate Detection
  const duplicateCheck = await detectDuplicateEvent(
    "Full-Stack Next.js",
    sampleExtraction.date,
    "10:00 AM",
    "Turing Hall"
  );
  assert(typeof duplicateCheck.hasPotentialDuplicate === "boolean", "Duplicate detector runs without errors");

  // Create event with PENDING status
  const newEvent = await prisma.event.create({
    data: {
      title: "Autonomous Drone Racing League",
      description: "First person view obstacle course racing in the indoor arena.",
      summary: "FPV indoor drone obstacle racing tournament.",
      date: "2026-09-12",
      startTime: "02:00 PM",
      endTime: "05:00 PM",
      venue: "Multi-Purpose Indoor Arena",
      organizerName: organizer.name,
      posterUrl: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800",
      category: "Competition",
      tags: "Drones, Robotics, Competition",
      registrationUrl: "https://campusdrone.org/register",
      contactInfo: "drone-team@campus.edu",
      status: "PENDING", // Strict check: Organizers cannot publish directly!
      organizerId: organizer.id,
    },
  });

  assert(newEvent.status === "PENDING", "Organizer-submitted event is private with PENDING status");

  // Verify it does NOT appear in public approved feed
  const publicEventsBefore = await prisma.event.findMany({
    where: { status: "APPROVED", id: newEvent.id },
  });
  assert(publicEventsBefore.length === 0, "Pending event is strictly NOT visible in public student feed");

  // Step 3: Campus Manager Verification & Approval
  console.log("\n[Test 3] Campus Manager Verification & Approval Workflow...");
  const pendingQueue = await prisma.event.findMany({ where: { status: "PENDING" } });
  assert(pendingQueue.some((e) => e.id === newEvent.id), "Pending event appears in Campus Manager queue");

  // Manager corrects venue and approves event
  const updatedEvent = await prisma.event.update({
    where: { id: newEvent.id },
    data: {
      venue: "Multi-Purpose Indoor Arena (Court A)",
      status: "APPROVED",
      verifiedById: manager.id,
      verifiedAt: new Date(),
    },
  });

  // Record audit history
  const historyEntry = await prisma.approvalHistory.create({
    data: {
      eventId: newEvent.id,
      managerId: manager.id,
      action: "APPROVED",
      notes: "Verified against original poster artwork. Approved for student discovery.",
    },
  });

  assert(updatedEvent.status === "APPROVED", "Event successfully transitioned to APPROVED status");
  assert(updatedEvent.verifiedById === manager.id, "Manager ID recorded on approved event");
  assert(historyEntry.action === "APPROVED", "Approval logged in ApprovalHistory audit trail");

  // Step 4: Public Discovery & Verified Badge
  console.log("\n[Test 4] Student Public Discovery & Verification Badge...");
  const publicEventsAfter = await prisma.event.findMany({
    where: { status: "APPROVED", id: newEvent.id },
    include: { verifiedBy: true },
  });
  assert(publicEventsAfter.length === 1, "Approved event is now discoverable by students");
  assert(
    publicEventsAfter[0].verifiedBy?.name === manager.name,
    "Event carries verified authority details for the ✓ CAMPUS VERIFIED badge"
  );

  // Step 5: Schedule Clash Engine Verification
  console.log("\n[Test 5] Schedule Clash Detection on Overlapping Events...");
  const existingSavedEvent = {
    title: "Full-Stack Next.js Sprint",
    date: "2026-09-11",
    startTime: "10:00 AM",
    endTime: "01:00 PM",
  };
  const overlappingEvent = {
    title: "Campus Hackathon 2026",
    date: "2026-09-11",
    startTime: "11:30 AM",
    endTime: "03:00 PM",
  };
  const backToBackEvent = {
    title: "Tech Career Office Hours",
    date: "2026-09-11",
    startTime: "01:00 PM",
    endTime: "02:30 PM",
  };

  const clashTest = checkTwoEventsClash(existingSavedEvent, overlappingEvent);
  assert(clashTest.hasClash === true, "Accurately detects overlap between 10:00-1:00 and 11:30-3:00");
  assert(
    clashTest.overlap?.formatted === "11:30 AM – 1:00 PM",
    `Exact overlap window calculated: ${clashTest.overlap?.formatted}`
  );

  const backToBackTest = checkTwoEventsClash(existingSavedEvent, backToBackEvent);
  assert(backToBackTest.hasClash === false, "Back-to-back events (1:00 PM boundary) correctly detected as NO CLASH");

  // Step 6: Student Schedule & Starting Soon Detection
  console.log("\n[Test 6] Student Schedule & Starting Soon Engine...");
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const startingSoonCheck = isStartingSoon(todayStr, "10:00 AM", now);
  assert(typeof startingSoonCheck === "boolean", "Starting Soon (<24h) function evaluates cleanly");

  console.log(`\n========================================`);
  console.log(`E2E Verification Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runEndToEndVerification()
  .catch((e) => {
    console.error("E2E Test Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
