"use server";

import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { contactSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function updateContactDetails(formData: {
  address: string;
  phones: string[];
  emails: string[];
  whatsappNumber?: string;
  whatsappGreeting: string;
  workingHours?: string;
  mapEmbedUrl?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
  linkedin?: string;
}) {
  await requireSession();

  const parsed = contactSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid contact details" };
  }

  const data = parsed.data;

  try {
    const existing = await prisma.contactDetails.findFirst();

    let updated;
    if (existing) {
      updated = await prisma.contactDetails.update({
        where: { id: existing.id },
        data: {
          address: data.address,
          phones: data.phones,
          emails: data.emails,
          whatsappNumber: data.whatsappNumber || null,
          whatsappGreeting: data.whatsappGreeting,
          workingHours: data.workingHours || "",
          mapEmbedUrl: data.mapEmbedUrl || null,
          facebook: data.facebook || null,
          instagram: data.instagram || null,
          youtube: data.youtube || null,
          twitter: data.twitter || null,
          linkedin: data.linkedin || null,
        },
      });
    } else {
      updated = await prisma.contactDetails.create({
        data: {
          address: data.address,
          phones: data.phones,
          emails: data.emails,
          whatsappNumber: data.whatsappNumber || null,
          whatsappGreeting: data.whatsappGreeting,
          workingHours: data.workingHours || "",
          mapEmbedUrl: data.mapEmbedUrl || null,
          facebook: data.facebook || null,
          instagram: data.instagram || null,
          youtube: data.youtube || null,
          twitter: data.twitter || null,
          linkedin: data.linkedin || null,
        },
      });
    }

    revalidatePath("/", "layout");
    revalidatePath("/contact");
    revalidatePath("/admin/contact");

    return { success: true, contact: updated };
  } catch (error) {
    console.error("Update contact details error:", error);
    return { error: "Failed to update contact details" };
  }
}
