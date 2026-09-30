import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  Building2,
  BookOpen,
  Image as ImageIcon,
  MessageSquare,
  ArrowRight,
  Clock,
  Phone,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [collegeCount, courseCount, galleryCount, newEnquiryCount, latestEnquiries] =
    await Promise.all([
      prisma.college.count(),
      prisma.course.count(),
      prisma.galleryItem.count(),
      prisma.enquiry.count({ where: { status: "NEW" } }),
      prisma.enquiry.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const stats = [
    {
      label: "Total Colleges",
      value: collegeCount,
      href: "/admin/colleges",
      icon: Building2,
      color: "bg-blue-600",
      accent: "text-blue-600",
      border: "border-blue-100",
    },
    {
      label: "Total Courses",
      value: courseCount,
      href: "/admin/courses",
      icon: BookOpen,
      color: "bg-amber-600",
      accent: "text-amber-600",
      border: "border-amber-100",
    },
    {
      label: "Gallery Assets",
      value: galleryCount,
      href: "/admin/gallery",
      icon: ImageIcon,
      color: "bg-emerald-600",
      accent: "text-emerald-600",
      border: "border-emerald-100",
    },
    {
      label: "New Enquiries",
      value: newEnquiryCount,
      href: "/admin/enquiries",
      icon: MessageSquare,
      color: "bg-rose-600",
      accent: "text-rose-600",
      border: "border-rose-100",
      highlight: newEnquiryCount > 0,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-blue-950 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-yellow-400/10 rounded-l-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <span className="px-3 py-1 bg-yellow-400/20 text-yellow-300 rounded-full text-xs font-bold uppercase tracking-wider">
            Management Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Welcome to the Admin Portal
          </h1>
          <p className="text-blue-200 text-sm mt-1 max-w-xl">
            Manage your colleges, academic courses, media gallery, contact information, and student
            enquiries in real-time.
          </p>
        </div>
        <div className="relative z-10 flex gap-3">
          <Link
            href="/admin/colleges"
            className="px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold text-sm shadow-md transition-all flex items-center gap-2"
          >
            <span>Add College</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map(({ label, value, href, icon: Icon, color, accent, border, highlight }) => (
          <Link
            key={label}
            href={href}
            className={`block p-6 rounded-2xl bg-white border ${border} shadow-sm hover:shadow-md transition-all group relative overflow-hidden`}
          >
            {highlight && (
              <span className="absolute top-3 right-3 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
              </span>
            )}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-500">{label}</span>
              <div
                className={`w-10 h-10 rounded-xl ${color} text-white flex items-center justify-center shadow-md`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-gray-900 tracking-tight">{value}</div>
            <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-gray-400 group-hover:text-blue-600 transition-colors">
              <span>Manage {label.toLowerCase()}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Latest Enquiries */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Latest Enquiries</h2>
            <p className="text-xs text-gray-500 mt-0.5">Most recent incoming student queries</p>
          </div>
          <Link
            href="/admin/enquiries"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View All Enquiries</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {latestEnquiries.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-700">No Enquiries Yet</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Incoming inquiries from the public website contact form and WhatsApp quick widget will
              show up here in real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/75 text-xs uppercase font-bold text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">College / Course</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {latestEnquiries.map((enquiry) => {
                  const cleanPhone = enquiry.phone.replace(/[^0-9]/g, "");
                  const waNumber = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
                  const replyText = `Hello ${enquiry.name}, thank you for reaching out to Prathvi Group of College regarding admissions. How may we assist you?`;

                  return (
                    <tr key={enquiry.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{enquiry.name}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">
                          {enquiry.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">
                          {enquiry.collegeName || "General Query"}
                        </div>
                        {enquiry.courseName && (
                          <div className="text-xs text-gray-500">{enquiry.courseName}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            enquiry.source === "WHATSAPP"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {enquiry.source === "WHATSAPP" ? "WhatsApp" : "Website Form"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            enquiry.status === "NEW"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : enquiry.status === "CONTACTED"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {enquiry.status === "NEW" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          )}
                          {enquiry.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(enquiry.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`https://wa.me/${waNumber}?text=${encodeURIComponent(replyText)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors"
                          >
                            <span>Reply</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
