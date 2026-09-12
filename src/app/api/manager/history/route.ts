import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["CAMPUS_MANAGER"]);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    const history = await prisma.approvalHistory.findMany({
      include: {
        event: {
          select: {
            id: true,
            title: true,
            posterUrl: true,
            category: true,
            date: true,
            venue: true,
            status: true,
          },
        },
        manager: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { timestamp: "desc" },
    });

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("Manager history query error:", error);
    return NextResponse.json(
      { error: "Failed to fetch verification audit history." },
      { status: 500 }
    );
  }
}
