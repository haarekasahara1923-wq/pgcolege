import { prisma } from "@/lib/db";
import CoursesClient from "./CoursesClient";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ collegeId?: string }>;
}

export default async function AdminCoursesPage({ searchParams }: Props) {
  const { collegeId } = await searchParams;

  const [colleges, courses] = await Promise.all([
    prisma.college.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    }),
    prisma.course.findMany({
      orderBy: [{ college: { order: "asc" } }, { order: "asc" }, { name: "asc" }],
      include: {
        college: {
          select: { id: true, name: true },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <CoursesClient
        initialColleges={colleges}
        initialCourses={courses}
        preselectedCollegeId={collegeId}
      />
    </div>
  );
}
