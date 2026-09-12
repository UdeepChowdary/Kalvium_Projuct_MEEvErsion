import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseTimeToMinutes } from "@/lib/clash";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim().toLowerCase() || "";
    const category = searchParams.get("category")?.trim() || "";
    const venue = searchParams.get("venue")?.trim() || "";
    const dateFilter = searchParams.get("dateFilter")?.trim() || ""; // "TODAY" | "TOMORROW" | "THIS_WEEK" | "UPCOMING"
    const sortBy = searchParams.get("sortBy") || "soonest"; // "soonest" | "latest" | "recently_added"

    // Reference date for demo consistency
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split("T")[0];

    // Build Prisma query condition
    const where: any = {
      status: "APPROVED", // Mandatory security rule: ONLY APPROVED events are public
    };

    if (category && category !== "ALL") {
      where.category = { equals: category };
    }

    if (venue && venue !== "ALL") {
      where.venue = { contains: venue };
    }

    if (dateFilter === "TODAY") {
      where.date = todayStr;
    } else if (dateFilter === "TOMORROW") {
      where.date = tomorrowStr;
    } else if (dateFilter === "THIS_WEEK") {
      where.date = {
        gte: todayStr,
        lte: nextWeekStr,
      };
    } else if (dateFilter === "UPCOMING") {
      where.date = {
        gte: todayStr,
      };
    }

    // Fetch matching approved events
    let events = await prisma.event.findMany({
      where,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        verifiedBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy:
        sortBy === "recently_added"
          ? { createdAt: "desc" }
          : sortBy === "latest"
          ? { date: "desc" }
          : { date: "asc" },
    });

    // In-memory text search filter across title, organizerName, venue, category, summary
    if (query) {
      events = events.filter((e) => {
        return (
          e.title.toLowerCase().includes(query) ||
          (e.organizerName && e.organizerName.toLowerCase().includes(query)) ||
          e.organizer.name.toLowerCase().includes(query) ||
          e.venue.toLowerCase().includes(query) ||
          e.category.toLowerCase().includes(query) ||
          e.summary.toLowerCase().includes(query)
        );
      });
    }

    // Sort by soonest (date + startTime)
    if (sortBy === "soonest") {
      events.sort((a, b) => {
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }
        return parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime);
      });
    }

    return NextResponse.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Public events query error:", error);
    return NextResponse.json(
      { error: "Failed to fetch campus events." },
      { status: 500 }
    );
  }
}
