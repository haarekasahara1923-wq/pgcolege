import { NextResponse } from "react";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    
    const updatedAffiliate = await prisma.affiliate.update({
      where: { id: resolvedParams.id },
      data: body,
    });

    return NextResponse.json({ success: true, affiliate: updatedAffiliate });
  } catch (error) {
    console.error("Error updating affiliate:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
