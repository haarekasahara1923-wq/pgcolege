"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Search,
  Filter,
  Download,
  Phone,
  Mail,
  Building2,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Loader2,
  X,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import {
  updateEnquiryStatus,
  updateEnquiryAdminNote,
  deleteEnquiry,
} from "@/actions/enquiry-actions";

interface EnquiryItem {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  collegeId: string | null;
  courseId: string | null;
  collegeName: string | null;
  courseName: string | null;
  message: string;
  source: "FORM" | "WHATSAPP";
  status: "NEW" | "CONTACTED" | "CLOSED";
  adminNote: string | null;
  ipAddress: string | null;
  createdAt: Date;
}

interface EnquiriesClientProps {
  initialEnquiries: EnquiryItem[];
}

export default function EnquiriesClient({ initialEnquiries }: EnquiriesClientProps) {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>(initialEnquiries);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sourceFilter, setSourceFilter] = useState<string>("ALL");

  // Selected for viewing / notes
  const [activeEnquiry, setActiveEnquiry] = useState<EnquiryItem | null>(null);
  const [editNote, setEditNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Delete target
  const [deleteTarget, setDeleteTarget] = useState<EnquiryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesStatus = statusFilter === "ALL" || e.status === statusFilter;
    const matchesSource = sourceFilter === "ALL" || e.source === sourceFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      e.name.toLowerCase().includes(q) ||
      e.phone.toLowerCase().includes(q) ||
      (e.email && e.email.toLowerCase().includes(q)) ||
      (e.collegeName && e.collegeName.toLowerCase().includes(q)) ||
      (e.courseName && e.courseName.toLowerCase().includes(q)) ||
      e.message.toLowerCase().includes(q);

    return matchesStatus && matchesSource && matchesSearch;
  });

  const handleStatusChange = async (enquiryId: string, newStatus: "NEW" | "CONTACTED" | "CLOSED") => {
    try {
      const res = await updateEnquiryStatus(enquiryId, newStatus);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Status updated to ${newStatus}`);
        setEnquiries((prev) =>
          prev.map((e) => (e.id === enquiryId ? { ...e, status: newStatus } : e))
        );
        if (activeEnquiry?.id === enquiryId) {
          setActiveEnquiry({ ...activeEnquiry, status: newStatus });
        }
        router.refresh();
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleSaveNote = async () => {
    if (!activeEnquiry) return;
    setSavingNote(true);
    try {
      const res = await updateEnquiryAdminNote(activeEnquiry.id, editNote.trim());
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Admin note saved");
        setEnquiries((prev) =>
          prev.map((e) => (e.id === activeEnquiry.id ? { ...e, adminNote: editNote.trim() } : e))
        );
        setActiveEnquiry({ ...activeEnquiry, adminNote: editNote.trim() });
        router.refresh();
      }
    } catch {
      toast.error("Failed to save note");
    } finally {
      setSavingNote(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await deleteEnquiry(deleteTarget.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Enquiry deleted");
        setEnquiries((prev) => prev.filter((e) => e.id !== deleteTarget.id));
        if (activeEnquiry?.id === deleteTarget.id) {
          setActiveEnquiry(null);
        }
        setDeleteTarget(null);
        router.refresh();
      }
    } catch {
      toast.error("Failed to delete enquiry");
    } finally {
      setDeleting(false);
    }
  };

  const exportToCSV = () => {
    if (filteredEnquiries.length === 0) {
      toast.error("No enquiries to export");
      return;
    }

    const headers = [
      "ID",
      "Date",
      "Name",
      "Phone",
      "Email",
      "College",
      "Course",
      "Source",
      "Status",
      "Admin Note",
      "Message",
    ];

    const rows = filteredEnquiries.map((e) => [
      `"${e.id}"`,
      `"${new Date(e.createdAt).toISOString()}"`,
      `"${e.name.replace(/"/g, '""')}"`,
      `"${e.phone}"`,
      `"${e.email || ""}"`,
      `"${(e.collegeName || "").replace(/"/g, '""')}"`,
      `"${(e.courseName || "").replace(/"/g, '""')}"`,
      `"${e.source}"`,
      `"${e.status}"`,
      `"${(e.adminNote || "").replace(/"/g, '""')}"`,
      `"${e.message.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `prathvi_enquiries_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-blue-900" />
            <span>Student Enquiries</span>
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Review, filter, track status, add internal notes, and reply via WhatsApp
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="px-4 py-2.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-blue-950 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export to CSV ({filteredEnquiries.length})</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, course..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Statuses ({enquiries.length})</option>
            <option value="NEW">New ({enquiries.filter((e) => e.status === "NEW").length})</option>
            <option value="CONTACTED">
              Contacted ({enquiries.filter((e) => e.status === "CONTACTED").length})
            </option>
            <option value="CLOSED">
              Closed ({enquiries.filter((e) => e.status === "CLOSED").length})
            </option>
          </select>
        </div>

        {/* Source Filter */}
        <div className="relative">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Sources</option>
            <option value="FORM">Website Form</option>
            <option value="WHATSAPP">WhatsApp Quick Widget</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredEnquiries.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-gray-400 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-gray-800">No Enquiries Found</h3>
          <p className="text-xs text-gray-500 mt-1">
            {enquiries.length === 0
              ? "New enquiries submitted through your public contact forms and WhatsApp buttons will appear here."
              : "No enquiries match your search or filter criteria."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">College &amp; Course</th>
                  <th className="px-6 py-4">Message Snippet</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Received</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEnquiries.map((item) => {
                  const cleanPhone = item.phone.replace(/[^0-9]/g, "");
                  const waNumber = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
                  const replyText = `Hello ${item.name}, thank you for contacting Prathvi Group of College regarding admission in ${item.courseName || item.collegeName || "our courses"}. How can we help you?`;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => {
                        setActiveEnquiry(item);
                        setEditNote(item.adminNote || "");
                      }}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">{item.phone}</div>
                        {item.email && <div className="text-xs text-gray-400">{item.email}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800 text-xs">
                          {item.collegeName || "General Institute Enquiry"}
                        </div>
                        {item.courseName && (
                          <div className="text-xs text-blue-700 font-medium">{item.courseName}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="text-xs text-gray-600 line-clamp-2">{item.message}</div>
                        {item.adminNote && (
                          <div className="text-[11px] text-amber-700 font-semibold mt-1">
                            Note: {item.adminNote}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            item.source === "WHATSAPP"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {item.source === "WHATSAPP" ? "WhatsApp" : "Form"}
                        </span>
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={item.status}
                          onChange={(e) =>
                            handleStatusChange(
                              item.id,
                              e.target.value as "NEW" | "CONTACTED" | "CLOSED"
                            )
                          }
                          className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition-colors cursor-pointer ${
                            item.status === "NEW"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : item.status === "CONTACTED"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-gray-100 text-gray-700 border-gray-200"
                          }`}
                        >
                          <option value="NEW">New</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`https://wa.me/${waNumber}?text=${encodeURIComponent(replyText)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors"
                            title="Reply on WhatsApp"
                          >
                            <span>WhatsApp</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete Enquiry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details & Notes Drawer / Modal */}
      {activeEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="font-extrabold text-base text-gray-900">Enquiry Details</h2>
                <span className="text-xs text-gray-500">ID: {activeEnquiry.id}</span>
              </div>
              <button
                onClick={() => setActiveEnquiry(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-sm text-gray-700">
              {/* Student info card */}
              <div className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-gray-400">Applicant Name</span>
                  <span className="font-bold text-gray-900 text-base">{activeEnquiry.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-gray-400">Mobile Number</span>
                  <span className="font-mono font-bold text-gray-900">{activeEnquiry.phone}</span>
                </div>
                {activeEnquiry.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-gray-400">Email Address</span>
                    <span className="text-gray-900">{activeEnquiry.email}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-gray-400">Target College</span>
                  <span className="font-semibold text-blue-900">
                    {activeEnquiry.collegeName || "Not specified"}
                  </span>
                </div>
                {activeEnquiry.courseName && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-gray-400">Target Course</span>
                    <span className="font-semibold text-blue-900">{activeEnquiry.courseName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-gray-400">Received At</span>
                  <span className="text-xs text-gray-500 font-mono">
                    {formatDate(activeEnquiry.createdAt)}
                  </span>
                </div>
                {activeEnquiry.ipAddress && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-gray-400">IP Address</span>
                    <span className="text-xs text-gray-400 font-mono">{activeEnquiry.ipAddress}</span>
                  </div>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Applicant&apos;s Message
                </label>
                <div className="p-4 bg-gray-50 rounded-xl text-gray-800 text-sm whitespace-pre-wrap leading-relaxed border border-gray-200">
                  {activeEnquiry.message}
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Update Enquiry Status
                </label>
                <div className="flex gap-2">
                  {(["NEW", "CONTACTED", "CLOSED"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(activeEnquiry.id, st)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeEnquiry.status === st
                          ? st === "NEW"
                            ? "bg-rose-600 text-white shadow-sm"
                            : st === "CONTACTED"
                            ? "bg-amber-600 text-white shadow-sm"
                            : "bg-gray-800 text-white shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Internal Note */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Internal Administrative Note
                </label>
                <textarea
                  rows={3}
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Record call summary, counselling notes, follow-up date..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handleSaveNote}
                    disabled={savingNote}
                    className="px-4 py-2 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {savingNote && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Note</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-slate-50">
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(activeEnquiry);
                  setActiveEnquiry(null);
                }}
                className="text-xs text-red-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Enquiry</span>
              </button>
              {(() => {
                const clean = activeEnquiry.phone.replace(/[^0-9]/g, "");
                const wa = clean.startsWith("91") ? clean : `91${clean}`;
                const text = `Hello ${activeEnquiry.name}, thank you for reaching out to Prathvi Group of College.`;
                return (
                  <a
                    href={`https://wa.me/${wa}?text=${encodeURIComponent(text)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-2"
                  >
                    <span>Reply on WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Delete Enquiry?</h3>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Are you sure you want to permanently delete the enquiry from{" "}
              <strong>{deleteTarget.name}</strong>?
            </p>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{deleting ? "Deleting..." : "Yes, Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
