import { prisma } from "@/lib/db";
import CollegesClient from "./CollegesClient";

export const dynamic = "force-dynamic";

export default async function AdminCollegesPage() {
  const colleges = await prisma.college.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: { courses: true, enquiries: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <CollegesClient initialColleges={colleges} />
    </div>
  );
}
