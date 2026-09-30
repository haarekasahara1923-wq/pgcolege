import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const [colleges, contact] = await Promise.all([
    prisma.college.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        courses: {
          orderBy: { order: "asc" },
          select: { id: true, name: true, duration: true, description: true, eligibility: true },
        },
      },
    }),
    prisma.contactDetails.findFirst({ select: { whatsappNumber: true } }),
  ]);

  return NextResponse.json({
    colleges,
    whatsappNumber: contact?.whatsappNumber ?? null,
  });
}
