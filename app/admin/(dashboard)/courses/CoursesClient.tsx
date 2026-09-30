"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Clock,
  GraduationCap,
  Filter,
  Search,
  Building2,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { createCourse, updateCourse, deleteCourse } from "@/actions/course-actions";

interface CollegeSummary {
  id: string;
  name: string;
}

interface CourseItem {
  id: string;
  collegeId: string;
  name: string;
  duration: string;
  description: string | null;
  eligibility: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  college: CollegeSummary;
}

interface CoursesClientProps {
  initialColleges: CollegeSummary[];
  initialCourses: CourseItem[];
  preselectedCollegeId?: string;
}

export default function CoursesClient({
  initialColleges,
  initialCourses,
  preselectedCollegeId,
}: CoursesClientProps) {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseItem[]>(initialCourses);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>(preselectedCollegeId || "ALL");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CourseItem | null>(null);

  // Form state
  const [collegeId, setCollegeId] = useState("");
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [order, setOrder] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const filteredCourses = courses.filter((c) => {
    const matchesCollege = selectedCollegeId === "ALL" || c.collegeId === selectedCollegeId;
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.college.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase())) ||
      (c.eligibility && c.eligibility.toLowerCase().includes(search.toLowerCase()));
    return matchesCollege && matchesSearch;
  });

  const openAddModal = () => {
    setEditingCourse(null);
    setCollegeId(selectedCollegeId !== "ALL" ? selectedCollegeId : initialColleges[0]?.id || "");
    setName("");
    setDuration("2 Years");
    setDescription("");
    setEligibility("");
    setOrder(0);
    setIsModalOpen(true);
  };

  const openEditModal = (crs: CourseItem) => {
    setEditingCourse(crs);
    setCollegeId(crs.collegeId);
    setName(crs.name);
    setDuration(crs.duration);
    setDescription(crs.description || "");
    setEligibility(crs.eligibility || "");
    setOrder(crs.order);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collegeId) {
      toast.error("Please select a college");
      return;
    }
    if (!name.trim()) {
      toast.error("Course name is required");
      return;
    }
    if (!duration.trim()) {
      toast.error("Course duration is required");
      return;
    }

    setSubmitting(true);
    try {
      if (editingCourse) {
        const res = await updateCourse(editingCourse.id, {
          collegeId,
          name: name.trim(),
          duration: duration.trim(),
          description: description.trim() || undefined,
          eligibility: eligibility.trim() || undefined,
          order: Number(order),
        });

        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Course updated successfully! Public site updated.");
          setIsModalOpen(false);
          router.refresh();
        }
      } else {
        const res = await createCourse({
          collegeId,
          name: name.trim(),
          duration: duration.trim(),
          description: description.trim() || undefined,
          eligibility: eligibility.trim() || undefined,
          order: Number(order),
        });

        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Course created successfully! Visible immediately on public site.");
          setIsModalOpen(false);
          router.refresh();
        }
      }
    } catch {
      toast.error("Failed to save course. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await deleteCourse(deleteTarget.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Course "${deleteTarget.name}" deleted.`);
        setDeleteTarget(null);
        router.refresh();
      }
    } catch {
      toast.error("Failed to delete course.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-blue-900" />
            <span>Courses Management</span>
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Add, configure degrees, diplomas, and certifications under each college
          </p>
        </div>
        <button
          onClick={openAddModal}
          disabled={initialColleges.length === 0}
          className="px-5 py-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 self-start sm:self-auto disabled:opacity-50 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Course</span>
        </button>
      </div>

      {initialColleges.length === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            You need to create at least one College before you can add courses. Please visit{" "}
            <a href="/admin/colleges" className="font-bold underline">
              Colleges Management
            </a>{" "}
            first.
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* College Filter Dropdown */}
        <div className="sm:w-72">
          <div className="relative">
            <Filter className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedCollegeId}
              onChange={(e) => setSelectedCollegeId(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none cursor-pointer"
            >
              <option value="ALL">All Colleges ({courses.length} courses)</option>
              {initialColleges.map((c) => {
                const count = courses.filter((x) => x.collegeId === c.id).length;
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by course name, college, or eligibility..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Courses List Table / Cards */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">No Courses Found</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
            {courses.length === 0
              ? "Start adding courses like MBA, B.Ed, Law, ITI, B.Pharma to your colleges."
              : "No courses match your selected filter or search term."}
          </p>
          {initialColleges.length > 0 && (
            <button
              onClick={openAddModal}
              className="mt-5 px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold text-sm inline-flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Course</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Course Name</th>
                  <th className="px-6 py-4">College</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Eligibility / Description</th>
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCourses.map((crs) => (
                  <tr key={crs.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 text-base">{crs.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-900 font-semibold text-xs">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>{crs.college.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 font-bold text-gray-800 text-xs">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{crs.duration}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      {crs.eligibility && (
                        <div className="text-xs font-medium text-gray-700">
                          <span className="font-bold text-gray-500">Eligibility:</span>{" "}
                          {crs.eligibility}
                        </div>
                      )}
                      {crs.description && (
                        <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                          {crs.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono font-bold text-gray-500">
                      {crs.order}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(crs)}
                          className="p-2 text-gray-600 hover:text-blue-900 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                          title="Edit Course"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(crs)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          title="Delete Course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <h2 className="font-extrabold text-lg text-gray-900">
                {editingCourse ? "Edit Course" : "Add New Course"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Parent College *
                </label>
                <select
                  required
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="" disabled>
                    Select College
                  </option>
                  {initialColleges.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Course Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. MBA (All Streams), B.Ed, D.Ed, Law, ITI (Electrical), B.Pharma"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Duration *
                  </label>
                  <input
                    type="text"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 2 Years / 3 Years"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Eligibility Criteria (Optional)
                </label>
                <input
                  type="text"
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  placeholder="e.g. Graduation in any stream with min 50% marks"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Description / Highlights (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief syllabus highlights, career prospects, specializations..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{submitting ? "Saving..." : editingCourse ? "Update Course" : "Create Course"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Course Confirm Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-gray-900">Delete Course?</h3>
            <p className="text-gray-600 text-sm mt-2 leading-relaxed">
              Are you sure you want to remove <strong>{deleteTarget.name}</strong> from{" "}
              <strong>{deleteTarget.college.name}</strong>?
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{submitting ? "Deleting..." : "Yes, Delete Course"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
