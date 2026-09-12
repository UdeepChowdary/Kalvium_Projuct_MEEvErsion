import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, DEMO_ACCOUNTS } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { role } = await req.json();

    if (!role || !["STUDENT", "ORGANIZER", "CAMPUS_MANAGER"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid demo role requested." },
        { status: 400 }
      );
    }

    const demoConfig = DEMO_ACCOUNTS[role as keyof typeof DEMO_ACCOUNTS];

    // Find the real seeded user in the database
    let user = await prisma.user.findUnique({
      where: { email: demoConfig.email },
    });

    if (!user) {
      // Create user if not present
      user = await prisma.user.create({
        data: {
          email: demoConfig.email,
          name: demoConfig.name,
          password: "demo_password_hash",
          role: demoConfig.role,
          avatar: demoConfig.avatar,
        },
      });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as "STUDENT" | "ORGANIZER" | "CAMPUS_MANAGER",
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    });

    // Set secure HTTP-only cookie
    response.cookies.set("campus_auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Demo login error:", error);
    return NextResponse.json(
      { error: "Internal server error during demo login." },
      { status: 500 }
    );
  }
}
