"use server";

import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { collegeSchema } from "@/lib/validators";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function createCollege(formData: {
  name: string;
  description: string;
  address?: string;
  order?: number;
  isActive?: boolean;
  imageUrl?: string;
  imagePublicId?: string;
}) {
  await requireSession();

  const parsed = collegeSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid college data" };
  }

  const { name, description, address, order, isActive } = parsed.data;

  // Generate unique slug
  let slug = slugify(name);
  const existing = await prisma.college.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  try {
    const college = await prisma.college.create({
      data: {
        name,
        slug,
        description,
        address: address || null,
        order: order ?? 0,
        isActive: isActive ?? true,
        imageUrl: formData.imageUrl || null,
        imagePublicId: formData.imagePublicId || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/colleges");
    revalidatePath("/admin/colleges");
    revalidatePath("/admin/courses");
    revalidatePath("/admin/dashboard");

    return { success: true, college };
  } catch (error) {
    console.error("Create college error:", error);
    return { error: "Failed to create college" };
  }
}

export async function updateCollege(
  id: string,
  formData: {
    name: string;
    description: string;
    address?: string;
    order?: number;
    isActive?: boolean;
    imageUrl?: string;
    imagePublicId?: string;
  }
) {
  await requireSession();

  const parsed = collegeSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid college data" };
  }

  const existingCollege = await prisma.college.findUnique({ where: { id } });
  if (!existingCollege) {
    return { error: "College not found" };
  }

  const { name, description, address, order, isActive } = parsed.data;

  // If replacing image, clean up old image from Cloudinary
  if (
    formData.imagePublicId &&
    existingCollege.imagePublicId &&
    formData.imagePublicId !== existingCollege.imagePublicId
  ) {
    await deleteCloudinaryAsset(existingCollege.imagePublicId, "image");
  }

  try {
    const college = await prisma.college.update({
      where: { id },
      data: {
        name,
        description,
        address: address || null,
        order: order ?? 0,
        isActive: isActive ?? true,
        imageUrl: formData.imageUrl !== undefined ? formData.imageUrl : existingCollege.imageUrl,
        imagePublicId:
          formData.imagePublicId !== undefined
            ? formData.imagePublicId
            : existingCollege.imagePublicId,
      },
    });

    revalidatePath("/");
    revalidatePath("/colleges");
    revalidatePath("/admin/colleges");
    revalidatePath("/admin/courses");
    revalidatePath("/admin/dashboard");

    return { success: true, college };
  } catch (error) {
    console.error("Update college error:", error);
    return { error: "Failed to update college" };
  }
}

export async function deleteCollege(id: string) {
  await requireSession();

  const college = await prisma.college.findUnique({ where: { id } });
  if (!college) {
    return { error: "College not found" };
  }

  // Delete image from Cloudinary if exists
  if (college.imagePublicId) {
    await deleteCloudinaryAsset(college.imagePublicId, "image");
  }

  try {
    // Cascade delete handles courses automatically
    await prisma.college.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/colleges");
    revalidatePath("/admin/colleges");
    revalidatePath("/admin/courses");
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Delete college error:", error);
    return { error: "Failed to delete college" };
  }
}
