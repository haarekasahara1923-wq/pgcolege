import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { enquirySchema } from "@/lib/validators";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/utils";
import { sendWhatsAppNotification } from "@/lib/whatsapp";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. IP-based rate limiting (max 5 submissions per hour)
  const { success: rateLimitOk } = checkRateLimit(request);
  if (!rateLimitOk) {
    return NextResponse.json(
      { error: "Too many enquiries. Please try again after an hour or contact us directly on WhatsApp." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    // 2. Honeypot check for bots
    if (body.honeypot && body.honeypot.length > 0) {
      // Pretend success so bots are tricked
      return NextResponse.json({ success: true, message: "Enquiry submitted successfully" });
    }

    // 3. Schema validation with Zod
    const parsed = enquirySchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || "Invalid input data";
      return NextResponse.json({ error: issue }, { status: 400 });
    }

    const { name, phone, email, collegeId, courseId, message, source } = parsed.data;

    // 4. Sanitize inputs
    const cleanName = sanitizeString(name);
    const cleanPhone = sanitizeString(phone);
    const cleanEmail = email ? sanitizeString(email) : null;
    const cleanMessage = sanitizeString(message);

    // 5. Lookup college and course names if IDs provided
    let collegeName: string | null = null;
    let courseName: string | null = null;

    if (collegeId) {
      const college = await prisma.college.findUnique({
        where: { id: collegeId },
        select: { name: true },
      });
      collegeName = college?.name || null;
    }

    if (courseId) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { name: true },
      });
      courseName = course?.name || null;
    }

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null;

    // 6. Save to DB
    const enquiry = await prisma.enquiry.create({
      data: {
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        collegeId: collegeId || null,
        courseId: courseId || null,
        collegeName,
        courseName,
        message: cleanMessage,
        source: source === "WHATSAPP" ? "WHATSAPP" : "FORM",
        status: "NEW",
        ipAddress,
      },
    });

    // 7. Revalidate admin pages
    try {
      revalidatePath("/admin/enquiries");
      revalidatePath("/admin/dashboard");
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    // 8. Optional WhatsApp Cloud API Notification to Admin
    sendWhatsAppNotification({
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      collegeName,
      courseName,
      message: cleanMessage,
      source: source || "FORM",
    }).catch((err) => console.error("WhatsApp notification error:", err));

    return NextResponse.json({
      success: true,
      message: "Enquiry submitted successfully! Our admissions team will reach out shortly.",
      id: enquiry.id,
    });
  } catch (error) {
    console.error("Enquiry submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit enquiry. Please try again or reach out on WhatsApp." },
      { status: 500 }
    );
  }
}
