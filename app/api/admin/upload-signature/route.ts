import {
  NextResponse,
  type NextRequest,
} from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateUploadSignature } from "@/lib/cloudinary";
import { revalidateTag } from "next/cache";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { folder: string; resourceType?: string };
  const { folder, resourceType } = body;

  const validFolders = ["prathi/colleges", "prathi/gallery", "prathi/about"];
  if (!validFolders.includes(folder)) {
    return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
  }

  const signatureData = generateUploadSignature(folder, resourceType);
  return NextResponse.json(signatureData);
}
