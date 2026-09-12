import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["ORGANIZER", "CAMPUS_MANAGER"]);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    const { user } = authResult;
    const body = await req.json();

    const {
      title,
      description,
      summary,
      date,
      startTime,
      endTime,
      venue,
      organizerName,
      posterUrl,
      category,
      tags,
      registrationUrl,
      contactInfo,
      confidences,
      duplicatesDetected,
    } = body;

    // Strict validation
    if (!title || !date || !startTime || !endTime || !venue || !category) {
      return NextResponse.json(
        { error: "Missing required fields: Title, Date, Start Time, End Time, Venue, and Category are mandatory." },
        { status: 400 }
      );
    }

    // Default fallback poster if none provided
    const resolvedPoster =
      posterUrl && posterUrl.trim().length > 0
        ? posterUrl
        : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80";

    const resolvedSummary =
      summary && summary.trim().length > 0
        ? summary.trim()
        : description.substring(0, 150) + "...";

    const formattedTags = Array.isArray(tags)
      ? tags.join(", ")
      : typeof tags === "string"
      ? tags
      : "Campus Event";

    // Create event with PENDING status (organizers cannot publish directly!)
    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        summary: resolvedSummary,
        date: date.trim(),
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        venue: venue.trim(),
        organizerName: organizerName ? organizerName.trim() : user.name,
        posterUrl: resolvedPoster,
        category: category.trim(),
        tags: formattedTags,
        registrationUrl: registrationUrl ? registrationUrl.trim() : "Not specified",
        contactInfo: contactInfo ? contactInfo.trim() : user.email,
        status: "PENDING", // Enforce pending status
        organizerId: user.userId,
      },
    });

    // Save event analysis snapshot for manager audit
    await prisma.eventAnalysis.create({
      data: {
        eventId: event.id,
        rawExtractedData: JSON.stringify(body),
        confidenceData: JSON.stringify(confidences || {}),
        duplicatesDetected: duplicatesDetected ? JSON.stringify(duplicatesDetected) : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Event submitted successfully for Campus Manager verification.",
      event,
    });
  } catch (error) {
    console.error("Submit event error:", error);
    return NextResponse.json(
      { error: "Failed to submit event. Please check your data and try again." },
      { status: 500 }
    );
  }
}
