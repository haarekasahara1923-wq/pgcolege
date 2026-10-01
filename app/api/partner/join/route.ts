import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      resAddress,
      officeAddress,
      mobileNo,
      whatsappNo,
      email,
      workingArea,
      courses
    } = body;

    // Generate a unique affiliate code (e.g., PGC-82A9)
    const uniqueStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const affiliateCode = `PGC-${uniqueStr}`;

    const newAffiliate = await prisma.affiliate.create({
      data: {
        name,
        resAddress,
        officeAddress,
        mobileNo,
        whatsappNo,
        email,
        workingArea,
        courses,
        affiliateCode,
      },
    });

    return NextResponse.json({ 
      success: true, 
      affiliateCode: newAffiliate.affiliateCode,
      message: "Partner registration successful" 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating affiliate:", error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: "A partner with this email or mobile number already exists." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
