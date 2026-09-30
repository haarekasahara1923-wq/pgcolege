"use server";

import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

export async function createGalleryItem(data: {
  type: "IMAGE" | "VIDEO";
  url: string;
  publicId?: string;
  youtubeUrl?: string;
  title?: string;
  category?: string;
  order?: number;
}) {
  await requireSession();

  try {
    const item = await prisma.galleryItem.create({
      data: {
        type: data.type,
        url: data.url,
        publicId: data.publicId || null,
        youtubeUrl: data.youtubeUrl || null,
        title: data.title || null,
        category: data.category || null,
        order: data.order ?? 0,
      },
    });

    revalidatePath("/");
    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    revalidatePath("/admin/dashboard");

    return { success: true, item };
  } catch (error) {
    console.error("Create gallery item error:", error);
    return { error: "Failed to create gallery item" };
  }
}

export async function deleteGalleryItem(id: string) {
  await requireSession();

  const item = await prisma.galleryItem.findUnique({ where: { id } });
  if (!item) {
    return { error: "Gallery item not found" };
  }

  // Delete from Cloudinary if publicId exists
  if (item.publicId) {
    const resourceType = item.type === "VIDEO" ? "video" : "image";
    await deleteCloudinaryAsset(item.publicId, resourceType);
  }

  try {
    await prisma.galleryItem.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Delete gallery item error:", error);
    return { error: "Failed to delete gallery item" };
  }
}
