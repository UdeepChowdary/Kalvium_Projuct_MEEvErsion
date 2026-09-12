import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["CAMPUS_MANAGER"]);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    // Get all events counts
    const allEvents = await prisma.event.findMany({
      select: { id: true, status: true },
    });

    const stats = {
      pending: allEvents.filter((e) => e.status === "PENDING").length,
      approved: allEvents.filter((e) => e.status === "APPROVED").length,
      declined: allEvents.filter((e) => e.status === "DECLINED").length,
      total: allEvents.length,
    };

    // Get pending events for review
    const pendingEvents = await prisma.event.findMany({
      where: { status: "PENDING" },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        analyses: {
          take: 1,
          orderBy: { analyzedAt: "desc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      stats,
      pendingEvents,
    });
  } catch (error) {
    console.error("Manager pending query error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending verification queue." },
      { status: 500 }
    );
  }
}
