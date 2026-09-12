import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function getRelativeDateStr(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split("T")[0];
}

async function main() {
  console.log("🌱 Seeding Campus Event Hub database...");

  // Clean existing tables
  await prisma.approvalHistory.deleteMany();
  await prisma.eventAnalysis.deleteMany();
  await prisma.savedEvent.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("demo12345", 10);

  // 1. Create Users
  console.log("Creating campus users...");

  const manager = await prisma.user.create({
    data: {
      email: "manager@campus.edu",
      name: "Dr. Alistair Sharma",
      password: passwordHash,
      role: "CAMPUS_MANAGER",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    },
  });

  const organizerRobotics = await prisma.user.create({
    data: {
      email: "robotics@campus.edu",
      name: "Robotics & AI Society",
      password: passwordHash,
      role: "ORGANIZER",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
  });

  const organizerDSC = await prisma.user.create({
    data: {
      email: "gdsc@campus.edu",
      name: "Developer Student Club",
      password: passwordHash,
      role: "ORGANIZER",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    },
  });

  const organizerCultural = await prisma.user.create({
    data: {
      email: "tedx@campus.edu",
      name: "Campus Cultural & Arts Board",
      password: passwordHash,
      role: "ORGANIZER",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  const organizerSports = await prisma.user.create({
    data: {
      email: "sports@campus.edu",
      name: "Varsity Athletics Council",
      password: passwordHash,
      role: "ORGANIZER",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
  });

  const studentAlex = await prisma.user.create({
    data: {
      email: "alex@campus.edu",
      name: "Alex Johnson",
      password: passwordHash,
      role: "STUDENT",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    },
  });

  const studentPriya = await prisma.user.create({
    data: {
      email: "priya@campus.edu",
      name: "Priya Patel",
      password: passwordHash,
      role: "STUDENT",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    },
  });

  // Dynamic dates
  const today = getRelativeDateStr(0);
  const tomorrow = getRelativeDateStr(1);
  const in2Days = getRelativeDateStr(2);
  const in3Days = getRelativeDateStr(3);
  const in5Days = getRelativeDateStr(5);
  const in7Days = getRelativeDateStr(7);

  console.log("Creating approved events...");

  // Approved Event 1: Starting Soon (<24 hours)
  const event1 = await prisma.event.create({
    data: {
      title: "AI & Autonomous Robotics Workshop",
      description: "A fast-paced hands-on workshop guiding students through the fundamentals of embedded computer vision and micro-ROS robotic control. Bring your laptops. Hardware kits provided.",
      summary: "Hands-on robotics workshop with embedded vision and micro-ROS kits.",
      date: today,
      startTime: "10:00 AM",
      endTime: "01:00 PM",
      venue: "Innovation Lab (Room 304, Tech Tower)",
      organizerName: "Robotics & AI Society",
      posterUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80",
      category: "Workshop",
      tags: "AI, Robotics, Hardware, Computer Vision",
      registrationUrl: "https://campus-hub.edu/events/robotics-2026",
      contactInfo: "robotics@campus.edu",
      status: "APPROVED",
      organizerId: organizerRobotics.id,
      verifiedById: manager.id,
      verifiedAt: new Date(Date.now() - 3600000 * 24),
    },
  });

  // Approved Event 2: Tomorrow morning (Part of clash scenario!)
  const event2 = await prisma.event.create({
    data: {
      title: "Full-Stack Next.js & AI Agent Sprint",
      description: "Learn how to build production-grade full-stack web applications with Next.js 14, streaming AI responses, and Postgres vector stores. Live pair coding exercises included.",
      summary: "Intensive 3-hour build sprint building Next.js apps with streaming AI agents.",
      date: tomorrow,
      startTime: "10:00 AM",
      endTime: "01:00 PM",
      venue: "Turing Hall, Computer Science Building",
      organizerName: "Developer Student Club",
      posterUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
      category: "Technical",
      tags: "Next.js, Web Development, Full Stack, TypeScript",
      registrationUrl: "https://gdsc-campus.dev/nextjs-agent-sprint",
      contactInfo: "gdsc@campus.edu",
      status: "APPROVED",
      organizerId: organizerDSC.id,
      verifiedById: manager.id,
      verifiedAt: new Date(Date.now() - 3600000 * 18),
    },
  });

  // Approved Event 3: Tomorrow midday (Overlaps with Event 2! 11:30 AM - 02:30 PM vs 10:00 AM - 01:00 PM)
  const event3 = await prisma.event.create({
    data: {
      title: "Campus Hackathon 2026: 24h Build Sprint",
      description: "The biggest annual hackathon on campus! 24 hours of non-stop innovation, developer mentorship from top tech companies, lightning talks, pizza, and $5,000 in student bounties.",
      summary: "Flagship 24-hour university hackathon focused on AI agents and student startups.",
      date: tomorrow,
      startTime: "11:30 AM",
      endTime: "03:00 PM",
      venue: "Main Campus Auditorium & Innovation Foyer",
      organizerName: "Developer Student Club",
      posterUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80",
      category: "Hackathon",
      tags: "Hackathon, Coding, Startups, Innovation, Prizes",
      registrationUrl: "https://campushack2026.dev",
      contactInfo: "hackathon-team@campus.edu",
      status: "APPROVED",
      organizerId: organizerDSC.id,
      verifiedById: manager.id,
      verifiedAt: new Date(Date.now() - 3600000 * 12),
    },
  });

  // Approved Event 4: Tomorrow afternoon (Back-to-back with Event 2! 01:00 PM - 02:30 PM -> NO CLASH with Event 2!)
  const event4 = await prisma.event.create({
    data: {
      title: "Tech Career & Open-Source Office Hours",
      description: "Informal drop-in session with senior students and alumni working in tech. Bring your resumes, portfolio links, and questions about open source contributions.",
      summary: "Casual career AMA and resume reviews with alumni engineers.",
      date: tomorrow,
      startTime: "01:00 PM",
      endTime: "02:30 PM",
      venue: "Student Lounge, 2nd Floor Library",
      organizerName: "Developer Student Club",
      posterUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
      category: "Seminar",
      tags: "Careers, Resume Review, Networking, Open Source",
      registrationUrl: "Not specified",
      contactInfo: "gdsc-mentors@campus.edu",
      status: "APPROVED",
      organizerId: organizerDSC.id,
      verifiedById: manager.id,
      verifiedAt: new Date(Date.now() - 3600000 * 10),
    },
  });

  // Approved Event 5: In 2 Days - Cultural Fest
  const event5 = await prisma.event.create({
    data: {
      title: "Harmony 2026: Campus Music & Arts Showcase",
      description: "Experience the rhythm of our vibrant student community. Featuring 8 student indie bands, classical instrumental performances, acoustic sets, and an open mic poetry slam.",
      summary: "Annual university music night with student rock bands and acoustic showcases.",
      date: in2Days,
      startTime: "05:00 PM",
      endTime: "10:00 PM",
      venue: "University Open-Air Amphitheatre",
      organizerName: "Campus Cultural & Arts Board",
      posterUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80",
      category: "Cultural",
      tags: "Music, Live Band, Festival, Arts, Open Mic",
      registrationUrl: "Not specified",
      contactInfo: "cultural@campus.edu",
      status: "APPROVED",
      organizerId: organizerCultural.id,
      verifiedById: manager.id,
      verifiedAt: new Date(Date.now() - 3600000 * 8),
    },
  });

  // Approved Event 6: In 3 Days - Sports
  const event6 = await prisma.event.create({
    data: {
      title: "Inter-Department Badminton Championship",
      description: "Annual smash tournament! Singles and doubles brackets across all engineering, science, and humanities departments. Trophies and departmental points awarded.",
      summary: "Competitive badminton singles & doubles knockout tournament.",
      date: in3Days,
      startTime: "09:00 AM",
      endTime: "04:00 PM",
      venue: "Indoor Sports Complex (Courts 1-4)",
      organizerName: "Varsity Athletics Council",
      posterUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80",
      category: "Sports",
      tags: "Badminton, Tournament, Athletics, Fitness",
      registrationUrl: "https://campus-hub.edu/sports/badminton-2026",
      contactInfo: "athletics@campus.edu",
      status: "APPROVED",
      organizerId: organizerSports.id,
      verifiedById: manager.id,
      verifiedAt: new Date(Date.now() - 3600000 * 6),
    },
  });

  // Approved Event 7: In 5 Days - Design Sprint
  const event7 = await prisma.event.create({
    data: {
      title: "UI/UX Product Design Masterclass: Modern Typography & Micro-Interactions",
      description: "An intensive masterclass on craft and taste in product design. Learn how to design editorial-grade digital interfaces with strong hierarchy, token systems, and motion.",
      summary: "Editorial UI design masterclass exploring typography and micro-interactions.",
      date: in5Days,
      startTime: "02:00 PM",
      endTime: "05:00 PM",
      venue: "Design Studio Room 402, Architecture Wing",
      organizerName: "Campus Cultural & Arts Board",
      posterUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80",
      category: "Technical",
      tags: "UI/UX, Product Design, Figma, Typography",
      registrationUrl: "https://campus-hub.edu/design-sprint",
      contactInfo: "design-guild@campus.edu",
      status: "APPROVED",
      organizerId: organizerCultural.id,
      verifiedById: manager.id,
      verifiedAt: new Date(Date.now() - 3600000 * 4),
    },
  });

  // Approved Event 8: In 7 Days - Fest
  const event8 = await prisma.event.create({
    data: {
      title: "Genesis 2026: Campus Tech & Innovation Fest",
      description: "Three days of robotics exhibitions, drone racing, gaming arenas, tech expos, and guest speakers from Silicon Valley and leading research labs.",
      summary: "Flagship annual inter-university technical festival with drone races and expos.",
      date: in7Days,
      startTime: "09:00 AM",
      endTime: "08:00 PM",
      venue: "Central Quad & Convention Center",
      organizerName: "Robotics & AI Society",
      posterUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
      category: "Fest",
      tags: "TechFest, Robotics, Drone Racing, Exhibits",
      registrationUrl: "https://genesis-fest.campus.edu",
      contactInfo: "genesis-core@campus.edu",
      status: "APPROVED",
      organizerId: organizerRobotics.id,
      verifiedById: manager.id,
      verifiedAt: new Date(Date.now() - 3600000 * 2),
    },
  });

  // Create Approval History records for approved events
  for (const ev of [event1, event2, event3, event4, event5, event6, event7, event8]) {
    await prisma.approvalHistory.create({
      data: {
        eventId: ev.id,
        managerId: manager.id,
        action: "APPROVED",
        notes: "Verified against original poster artwork. Approved for student discovery.",
        timestamp: ev.verifiedAt || new Date(),
      },
    });
  }

  // 2. Create PENDING events for Campus Manager to review
  console.log("Creating pending events for Manager verification queue...");

  const pendingEvent1 = await prisma.event.create({
    data: {
      title: "Inter-College Autonomous Drone League",
      description: "First person view (FPV) obstacle course racing and autonomous gate navigation competition. Teams must navigate custom indoor courses under 90 seconds.",
      summary: "FPV and autonomous indoor drone obstacle course race with cash prizes.",
      date: getRelativeDateStr(4),
      startTime: "02:00 PM",
      endTime: "06:00 PM",
      venue: "Multi-Purpose Indoor Arena",
      organizerName: "Robotics & AI Society",
      posterUrl: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80",
      category: "Competition",
      tags: "Drones, Robotics, Competition, FPV",
      registrationUrl: "https://campusdrone.org/register",
      contactInfo: "drone-society@campus.edu",
      status: "PENDING",
      organizerId: organizerRobotics.id,
    },
  });

  await prisma.eventAnalysis.create({
    data: {
      eventId: pendingEvent1.id,
      rawExtractedData: JSON.stringify({
        title: "Inter-College Autonomous Drone League",
        date: getRelativeDateStr(4),
        startTime: "02:00 PM",
        endTime: "06:00 PM",
        venue: "Multi-Purpose Indoor Arena",
        organizer: "Robotics & AI Society",
        category: "Competition",
      }),
      confidenceData: JSON.stringify({
        title: "HIGH",
        date: "HIGH",
        startTime: "MEDIUM",
        endTime: "MEDIUM",
        venue: "HIGH",
        organizerName: "HIGH",
      }),
      duplicatesDetected: null,
    },
  });

  const pendingEvent2 = await prisma.event.create({
    data: {
      title: "Venture Pitch Night: Student Startup Showcase",
      description: "7 student teams pitch their early-stage software and hardware startups to a panel of 4 venture capital partners and alumni angel investors.",
      summary: "Student startup demo day with pitches to alumni angel investors.",
      date: getRelativeDateStr(6),
      startTime: "06:30 PM",
      endTime: "09:30 PM",
      venue: "Auditorium Annex, Business School",
      organizerName: "Developer Student Club",
      posterUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80",
      category: "Seminar",
      tags: "Startups, Venture Capital, Pitch, Entrepreneurship",
      registrationUrl: "Not specified",
      contactInfo: "ventures@campus.edu",
      status: "PENDING",
      organizerId: organizerDSC.id,
    },
  });

  await prisma.eventAnalysis.create({
    data: {
      eventId: pendingEvent2.id,
      rawExtractedData: JSON.stringify({
        title: "Venture Pitch Night: Student Startup Showcase",
        date: getRelativeDateStr(6),
        startTime: "06:30 PM",
        endTime: "09:30 PM",
        venue: "Auditorium Annex, Business School",
      }),
      confidenceData: JSON.stringify({
        title: "HIGH",
        date: "HIGH",
        startTime: "HIGH",
        endTime: "LOW",
        venue: "MEDIUM",
        organizerName: "LOW",
      }),
      duplicatesDetected: null,
    },
  });

  // 3. Create DECLINED events
  console.log("Creating declined events...");

  const declinedEvent1 = await prisma.event.create({
    data: {
      title: "Late Night Rooftop Laser Rave",
      description: "Unofficial late night music gathering on the Science building rooftop.",
      summary: "Unauthorized rooftop electronic music event.",
      date: getRelativeDateStr(2),
      startTime: "11:00 PM",
      endTime: "03:00 AM",
      venue: "Science Building Rooftop",
      organizerName: "Anonymous Student Group",
      posterUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80",
      category: "Cultural",
      tags: "Music, Unofficial",
      registrationUrl: "Not specified",
      contactInfo: "Not specified",
      status: "DECLINED",
      declineReason: "Unauthorized organizer",
      declineCustomNotes: "Rooftops are restricted zones. Campus facility regulations prohibit unpermitted gatherings after 10 PM.",
      organizerId: organizerCultural.id,
      verifiedById: manager.id,
      verifiedAt: new Date(Date.now() - 3600000 * 48),
    },
  });

  await prisma.approvalHistory.create({
    data: {
      eventId: declinedEvent1.id,
      managerId: manager.id,
      action: "DECLINED",
      reason: "Unauthorized organizer",
      notes: "Rooftops are restricted zones. Campus safety rules prohibit unpermitted gatherings after 10 PM.",
      timestamp: new Date(Date.now() - 3600000 * 48),
    },
  });

  // 4. Create Saved Events for Student Alex (Setting up Starting Soon & Clashing pair)
  console.log("Saving initial events for student Alex...");

  // Save Event 1 (Starting Soon today)
  await prisma.savedEvent.create({
    data: {
      userId: studentAlex.id,
      eventId: event1.id,
    },
  });

  // Save Event 2 (Tomorrow 10:00 AM - 1:00 PM)
  await prisma.savedEvent.create({
    data: {
      userId: studentAlex.id,
      eventId: event2.id,
    },
  });

  // Save Event 3 (Tomorrow 11:30 AM - 3:00 PM -> Creates intentional schedule clash for demo!)
  await prisma.savedEvent.create({
    data: {
      userId: studentAlex.id,
      eventId: event3.id,
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log(`
  Demo Credentials:
  - Student:        alex@campus.edu (Alex Johnson)
  - Organizer:      robotics@campus.edu (Robotics Society)
  - Campus Manager: manager@campus.edu (Dr. Alistair Sharma)
  Password for all: demo12345
  `);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
