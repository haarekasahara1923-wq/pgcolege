import { NextResponse, type NextRequest } from "next/server";
import { requireSession } from "@/lib/auth";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { publicId: string; resourceType?: "image" | "video" };
  const { publicId, resourceType = "image" } = body;

  if (!publicId) {
    return NextResponse.json({ error: "publicId is required" }, { status: 400 });
  }

  await deleteCloudinaryAsset(publicId, resourceType);
  return NextResponse.json({ success: true });
}
