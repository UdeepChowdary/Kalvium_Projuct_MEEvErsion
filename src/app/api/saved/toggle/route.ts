import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["STUDENT", "ORGANIZER", "CAMPUS_MANAGER"]);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    const { user } = authResult;
    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }

    // Verify event exists and is APPROVED
    const targetEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!targetEvent) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    if (targetEvent.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Only approved campus events can be saved to schedule." },
        { status: 400 }
      );
    }

    // Check if already saved
    const existing = await prisma.savedEvent.findUnique({
      where: {
        userId_eventId: {
          userId: user.userId,
          eventId,
        },
      },
    });

    if (existing) {
      // Unsave
      await prisma.savedEvent.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({
        success: true,
        saved: false,
        message: "Event removed from your schedule.",
      });
    } else {
      // Save
      await prisma.savedEvent.create({
        data: {
          userId: user.userId,
          eventId,
        },
      });
      return NextResponse.json({
        success: true,
        saved: true,
        message: "Event added to your personal schedule.",
      });
    }
  } catch (error) {
    console.error("Toggle saved event error:", error);
    return NextResponse.json(
      { error: "Failed to update saved event." },
      { status: 500 }
    );
  }
}
