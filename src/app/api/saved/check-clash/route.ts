import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { checkTwoEventsClash } from "@/lib/clash";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ hasClash: false });
    }

    const { eventId } = await req.json();
    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }

    // Fetch the target event to be saved
    const targetEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!targetEvent) {
      return NextResponse.json({ error: "Target event not found." }, { status: 404 });
    }

    // Fetch all currently saved events for this user
    const savedRecords = await prisma.savedEvent.findMany({
      where: { userId: auth.userId },
      include: {
        event: true,
      },
    });

    // Check if target event is already saved
    const isAlreadySaved = savedRecords.some((r) => r.eventId === eventId);

    // Look for clashes among existing saved events
    for (const record of savedRecords) {
      if (record.eventId === eventId) continue;
      const existing = record.event;
      const clash = checkTwoEventsClash(targetEvent, existing);

      if (clash.hasClash && clash.overlap) {
        return NextResponse.json({
          hasClash: true,
          isAlreadySaved,
          conflictingEvent: {
            id: existing.id,
            title: existing.title,
            date: existing.date,
            startTime: existing.startTime,
            endTime: existing.endTime,
            venue: existing.venue,
          },
          targetEvent: {
            id: targetEvent.id,
            title: targetEvent.title,
            date: targetEvent.date,
            startTime: targetEvent.startTime,
            endTime: targetEvent.endTime,
            venue: targetEvent.venue,
          },
          overlap: clash.overlap,
        });
      }
    }

    return NextResponse.json({
      hasClash: false,
      isAlreadySaved,
    });
  } catch (error) {
    console.error("Check clash error:", error);
    return NextResponse.json({ hasClash: false });
  }
}
