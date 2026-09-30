import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import WhatsAppButton from "@/components/public/WhatsAppButton";
import AutoRefresh from "@/components/public/AutoRefresh";

export const dynamic = "force-dynamic";

async function getContactDetails() {
  try {
    return await prisma.contactDetails.findFirst();
  } catch {
    return null;
  }
}

async function getCollegesForWA() {
  try {
    return await prisma.college.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        courses: { select: { id: true, name: true }, orderBy: { order: "asc" } },
      },
    });
  } catch {
    return [];
  }
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [contact, colleges] = await Promise.all([getContactDetails(), getCollegesForWA()]);

  return (
    <>
      <AutoRefresh />
      <Navbar />
      <main className="pt-20 min-h-screen">{children}</main>
      <Footer contact={contact} />
      <WhatsAppButton
        whatsappNumber={contact?.whatsappNumber ?? undefined}
        greeting={contact?.whatsappGreeting}
        colleges={colleges}
      />
    </>
  );
}
