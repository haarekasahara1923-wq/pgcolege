"use server";

import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateEnquiryStatus(id: string, status: "NEW" | "CONTACTED" | "CLOSED") {
  await requireSession();

  try {
    const enquiry = await prisma.enquiry.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin/enquiries");
    revalidatePath("/admin/dashboard");

    return { success: true, enquiry };
  } catch (error) {
    console.error("Update enquiry status error:", error);
    return { error: "Failed to update enquiry status" };
  }
}

export async function updateEnquiryAdminNote(id: string, adminNote: string) {
  await requireSession();

  try {
    const enquiry = await prisma.enquiry.update({
      where: { id },
      data: { adminNote },
    });

    revalidatePath("/admin/enquiries");
    revalidatePath("/admin/dashboard");

    return { success: true, enquiry };
  } catch (error) {
    console.error("Update enquiry note error:", error);
    return { error: "Failed to update admin note" };
  }
}

export async function deleteEnquiry(id: string) {
  await requireSession();

  try {
    await prisma.enquiry.delete({ where: { id } });

    revalidatePath("/admin/enquiries");
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Delete enquiry error:", error);
    return { error: "Failed to delete enquiry" };
  }
}
