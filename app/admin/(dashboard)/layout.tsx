import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const contact = await prisma.contactDetails.findFirst({
    select: { logoUrl: true },
  });

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar email={session.email} logoUrl={contact?.logoUrl} />
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen transition-all">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
