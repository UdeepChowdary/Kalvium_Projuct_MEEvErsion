import { NextResponse } from "next/server";
import { formatLocalDate } from "@/lib/time";

export const dynamic = "force-dynamic";

export async function GET() {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || "";
  const rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
  
  const hasProjectId = Boolean(projectId);
  const hasClientEmail = Boolean(clientEmail);
  const hasPrivateKey = rawKey.length > 50;
  const keyHeaderOk = rawKey.includes("BEGIN PRIVATE KEY");
  const keyHasRealNewlines = rawKey.includes("\n");
  const keyHasEscapedNewlines = rawKey.includes("\\n");

  return NextResponse.json({
    status: "ok",
    deployedAt: new Date().toISOString(),
    campusDate: formatLocalDate(new Date()),
    environment: {
      hasProjectId,
      projectId: projectId || "MISSING",
      hasClientEmail,
      clientEmailMasked: clientEmail ? `${clientEmail.substring(0, 6)}...` : "MISSING",
      hasPrivateKey,
      keyLength: rawKey.length,
      keyHeaderOk,
      keyHasRealNewlines,
      keyHasEscapedNewlines,
    },
  });
}
