import { prisma } from "@/lib/db";
import AboutClient from "./AboutClient";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  const about = await prisma.aboutContent.findFirst();

  return (
    <div className="space-y-6">
      <AboutClient initialAbout={about} />
    </div>
  );
}
