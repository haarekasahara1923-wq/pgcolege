import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { generateUploadSignature } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const folder = body.folder || "prathi/gallery";
    const resourceType = body.resourceType; // e.g. "image" or "video"

    // Allow only designated folders for security
    const allowedFolders = ["prathi/colleges", "prathi/gallery", "prathi/about"];
    const targetFolder = allowedFolders.includes(folder) ? folder : "prathi/gallery";

    const signatureData = generateUploadSignature(targetFolder, resourceType);

    return NextResponse.json(signatureData);
  } catch (error) {
    console.error("Signature generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}
