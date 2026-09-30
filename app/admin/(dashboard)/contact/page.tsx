import { prisma } from "@/lib/db";
import ContactClient from "./ContactClient";

export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
  const contact = await prisma.contactDetails.findFirst();

  return (
    <div className="space-y-6">
      <ContactClient initialContact={contact} />
    </div>
  );
}
