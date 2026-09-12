import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "campus_event_hub_secure_key_2026_secret";

export interface TokenPayload {
  userId: string;
  email: string;
  role: "STUDENT" | "ORGANIZER" | "CAMPUS_MANAGER";
  name: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Extracts the authenticated user payload from the incoming NextRequest.
 * Checks Bearer Authorization header or the campus_auth_token HTTP cookie.
 */
export async function getAuthUser(req: NextRequest): Promise<TokenPayload | null> {
  const authHeader = req.headers.get("authorization");
  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    const cookie = req.cookies.get("campus_auth_token");
    if (cookie) token = cookie.value;
  }

  if (!token) return null;
  return verifyToken(token);
}

/**
 * Enforces role-based authorization on an API endpoint.
 * Returns either the authorized user or a JSON error response (401 or 403).
 */
export async function requireAuth(
  req: NextRequest,
  allowedRoles?: Array<"STUDENT" | "ORGANIZER" | "CAMPUS_MANAGER">
): Promise<{ user: TokenPayload } | { errorResponse: NextResponse }> {
  const user = await getAuthUser(req);

  if (!user) {
    return {
      errorResponse: NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return {
      errorResponse: NextResponse.json(
        {
          error: `Access denied. Role '${user.role}' is not authorized for this operation.`,
        },
        { status: 403 }
      ),
    };
  }

  return { user };
}

/**
 * Demo Account definitions for instant evaluation.
 * Note: These log into real seeded database accounts with real JWTs.
 */
export const DEMO_ACCOUNTS = {
  STUDENT: {
    email: "alex@campus.edu",
    name: "Alex Johnson",
    role: "STUDENT",
    title: "CS Sophomore",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  ORGANIZER: {
    email: "robotics@campus.edu",
    name: "Robotics & AI Society",
    role: "ORGANIZER",
    title: "Official Campus Tech Society",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  CAMPUS_MANAGER: {
    email: "manager@campus.edu",
    name: "Dr. Alistair Sharma",
    role: "CAMPUS_MANAGER",
    title: "Dean of Student Affairs & Campus Life",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
  },
};
