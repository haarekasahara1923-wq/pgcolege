import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ affiliateCode: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    const { businessName, bankAccountNo, ifscCode } = body;

    const affiliate = await prisma.affiliate.update({
      where: { affiliateCode: resolvedParams.affiliateCode },
      data: {
        businessName,
        bankAccountNo,
        ifscCode,
      },
    });

    return NextResponse.json({ success: true, affiliate });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
