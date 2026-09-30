"use server";

import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { aboutSchema } from "@/lib/validators";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

export async function updateAboutContent(formData: {
  title: string;
  description: string;
  vision: string;
  mission: string;
  imageUrl?: string;
  imagePublicId?: string;
}) {
  await requireSession();

  const parsed = aboutSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid about content" };
  }

  const { title, description, vision, mission } = parsed.data;

  try {
    const existing = await prisma.aboutContent.findFirst();

    if (
      formData.imagePublicId &&
      existing?.imagePublicId &&
      formData.imagePublicId !== existing.imagePublicId
    ) {
      await deleteCloudinaryAsset(existing.imagePublicId, "image");
    }

    let updated;
    if (existing) {
      updated = await prisma.aboutContent.update({
        where: { id: existing.id },
        data: {
          title,
          description,
          vision,
          mission,
          imageUrl: formData.imageUrl !== undefined ? formData.imageUrl : existing.imageUrl,
          imagePublicId:
            formData.imagePublicId !== undefined
              ? formData.imagePublicId
              : existing.imagePublicId,
        },
      });
    } else {
      updated = await prisma.aboutContent.create({
        data: {
          title,
          description,
          vision,
          mission,
          imageUrl: formData.imageUrl || null,
          imagePublicId: formData.imagePublicId || null,
        },
      });
    }

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/admin/about");

    return { success: true, about: updated };
  } catch (error) {
    console.error("Update about content error:", error);
    return { error: "Failed to update about content" };
  }
}
