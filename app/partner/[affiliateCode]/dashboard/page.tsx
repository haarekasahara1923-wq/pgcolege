import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function AffiliateDashboard({
  params,
}: {
  params: Promise<{ affiliateCode: string }>;
}) {
  const resolvedParams = await params;
  const affiliate = await prisma.affiliate.findUnique({
    where: { affiliateCode: resolvedParams.affiliateCode },
    include: {
      students: {
        orderBy: { createdAt: 'desc' }
      }
    },
  });

  if (!affiliate) {
    notFound();
  }

  // Convert dates to string for client component
  const affiliateData = {
    ...affiliate,
    createdAt: affiliate.createdAt.toISOString(),
    updatedAt: affiliate.updatedAt.toISOString(),
    students: affiliate.students.map(s => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }))
  };

  return <DashboardClient affiliate={affiliateData} />;
}
