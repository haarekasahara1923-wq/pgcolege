import { Metadata } from "next";
import { prisma } from "@/lib/db";
import AffiliatesClient from "./AffiliatesClient";

export const metadata: Metadata = {
  title: "Affiliate Partners | Admin Dashboard",
  description: "Manage affiliate partners",
};

export default async function AffiliatesPage() {
  const affiliates = await prisma.affiliate.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      students: true,
    }
  });

  const formattedAffiliates = affiliates.map(a => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    studentsCount: a.students.length,
    students: a.students.map(s => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }))
  }));

  return <AffiliatesClient initialAffiliates={formattedAffiliates} />;
}
