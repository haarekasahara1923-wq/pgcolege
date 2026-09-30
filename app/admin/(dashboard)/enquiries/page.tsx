import { prisma } from "@/lib/db";
import EnquiriesClient from "./EnquiriesClient";

export const dynamic = "force-dynamic";

export default async function AdminEnquiriesPage() {
  const enquiries = await prisma.enquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <EnquiriesClient initialEnquiries={enquiries} />
    </div>
  );
}
