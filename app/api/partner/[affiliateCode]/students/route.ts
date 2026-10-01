import { NextResponse } from "react";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ affiliateCode: string }> }
) {
  try {
    const body = await req.json();
    
    // Create new student linked to this affiliate
    const newStudent = await prisma.student.create({
      data: {
        ...body
      },
    });

    return NextResponse.json({ success: true, student: newStudent });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
