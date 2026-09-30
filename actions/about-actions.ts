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
  directorName?: string;
  directorMessage?: string;
  directorImageUrl?: string;
  directorImageId?: string;
  principalName?: string;
  principalMessage?: string;
  principalImageUrl?: string;
  principalImageId?: string;
}) {
  await requireSession();

  const parsed = aboutSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid about content" };
  }

  const { title, description, vision, mission, directorName, directorMessage, principalName, principalMessage } = parsed.data;

  try {
    const existing = await prisma.aboutContent.findFirst();

    if (
      formData.imagePublicId &&
      existing?.imagePublicId &&
      formData.imagePublicId !== existing.imagePublicId
    ) {
      await deleteCloudinaryAsset(existing.imagePublicId, "image");
    }

    if (
      formData.directorImageId &&
      existing?.directorImageId &&
      formData.directorImageId !== existing.directorImageId
    ) {
      await deleteCloudinaryAsset(existing.directorImageId, "image");
    }

    if (
      formData.principalImageId &&
      existing?.principalImageId &&
      formData.principalImageId !== existing.principalImageId
    ) {
      await deleteCloudinaryAsset(existing.principalImageId, "image");
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
          directorName: directorName !== undefined ? directorName : existing.directorName,
          directorMessage: directorMessage !== undefined ? directorMessage : existing.directorMessage,
          directorImageUrl: formData.directorImageUrl !== undefined ? formData.directorImageUrl : existing.directorImageUrl,
          directorImageId: formData.directorImageId !== undefined ? formData.directorImageId : existing.directorImageId,
          principalName: principalName !== undefined ? principalName : existing.principalName,
          principalMessage: principalMessage !== undefined ? principalMessage : existing.principalMessage,
          principalImageUrl: formData.principalImageUrl !== undefined ? formData.principalImageUrl : existing.principalImageUrl,
          principalImageId: formData.principalImageId !== undefined ? formData.principalImageId : existing.principalImageId,
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
          directorName: directorName || null,
          directorMessage: directorMessage || null,
          directorImageUrl: formData.directorImageUrl || null,
          directorImageId: formData.directorImageId || null,
          principalName: principalName || null,
          principalMessage: principalMessage || null,
          principalImageUrl: formData.principalImageUrl || null,
          principalImageId: formData.principalImageId || null,
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
