"use server";

import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { courseSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function createCourse(formData: {
  collegeId: string;
  name: string;
  duration: string;
  description?: string;
  eligibility?: string;
  order?: number;
}) {
  await requireSession();

  const parsed = courseSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid course data" };
  }

  const { collegeId, name, duration, description, eligibility, order } = parsed.data;

  try {
    const course = await prisma.course.create({
      data: {
        collegeId,
        name,
        duration,
        description: description || null,
        eligibility: eligibility || null,
        order: order ?? 0,
      },
    });

    revalidatePath("/");
    revalidatePath("/colleges");
    revalidatePath("/admin/courses");
    revalidatePath("/admin/colleges");
    revalidatePath("/admin/dashboard");

    return { success: true, course };
  } catch (error) {
    console.error("Create course error:", error);
    return { error: "Failed to create course" };
  }
}

export async function updateCourse(
  id: string,
  formData: {
    collegeId: string;
    name: string;
    duration: string;
    description?: string;
    eligibility?: string;
    order?: number;
  }
) {
  await requireSession();

  const parsed = courseSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid course data" };
  }

  const { collegeId, name, duration, description, eligibility, order } = parsed.data;

  try {
    const course = await prisma.course.update({
      where: { id },
      data: {
        collegeId,
        name,
        duration,
        description: description || null,
        eligibility: eligibility || null,
        order: order ?? 0,
      },
    });

    revalidatePath("/");
    revalidatePath("/colleges");
    revalidatePath("/admin/courses");
    revalidatePath("/admin/colleges");
    revalidatePath("/admin/dashboard");

    return { success: true, course };
  } catch (error) {
    console.error("Update course error:", error);
    return { error: "Failed to update course" };
  }
}

export async function deleteCourse(id: string) {
  await requireSession();

  try {
    await prisma.course.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/colleges");
    revalidatePath("/admin/courses");
    revalidatePath("/admin/colleges");
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Delete course error:", error);
    return { error: "Failed to delete course" };
  }
}
