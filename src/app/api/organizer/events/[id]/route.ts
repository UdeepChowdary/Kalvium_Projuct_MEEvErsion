import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(req, ["ORGANIZER", "CAMPUS_MANAGER"]);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    const { user } = authResult;
    const eventId = params.id;

    // Verify the event belongs to this organizer (unless they are a manager)
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    if (user.role === "ORGANIZER" && existingEvent.organizerId !== user.userId) {
      return NextResponse.json(
        { error: "You don't have permission to delete this event." },
        { status: 403 }
      );
    }

    // Delete the event
    await prisma.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ success: true, message: "Event deleted successfully." });
  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json(
      { error: "Failed to delete event." },
      { status: 500 }
    );
  }
}
