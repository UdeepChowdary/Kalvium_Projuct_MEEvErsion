import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["ORGANIZER", "CAMPUS_MANAGER"]);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    const { user } = authResult;

    // Fetch organizer's submissions
    const events = await prisma.event.findMany({
      where: {
        organizerId: user.userId,
      },
      include: {
        verifiedBy: {
          select: {
            name: true,
            email: true,
          },
        },
        approvalHistory: {
          take: 1,
          orderBy: { timestamp: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const stats = {
      total: events.length,
      pending: events.filter((e) => e.status === "PENDING").length,
      approved: events.filter((e) => e.status === "APPROVED").length,
      declined: events.filter((e) => e.status === "DECLINED").length,
    };

    return NextResponse.json({
      success: true,
      stats,
      events,
    });
  } catch (error) {
    console.error("Organizer events query error:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizer submissions." },
      { status: 500 }
    );
  }
}
