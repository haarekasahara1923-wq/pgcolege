import { prisma } from "@/lib/db";
import GalleryClient from "./GalleryClient";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const items = await prisma.galleryItem.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <GalleryClient initialItems={items} />
    </div>
  );
}
