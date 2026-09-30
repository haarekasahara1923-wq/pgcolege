"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  MapPin,
  Upload,
  Loader2,
  X,
  AlertTriangle,
  Search,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { createCollege, updateCollege, deleteCollege } from "@/actions/college-actions";

interface CollegeItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  imagePublicId: string | null;
  address: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    courses: number;
    enquiries: number;
  };
}

interface CollegesClientProps {
  initialColleges: CollegeItem[];
}

export default function CollegesClient({ initialColleges }: CollegesClientProps) {
  const router = useRouter();
  const [colleges, setColleges] = useState<CollegeItem[]>(initialColleges);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState<CollegeItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CollegeItem | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [currentPublicId, setCurrentPublicId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const filteredColleges = colleges.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditingCollege(null);
    setName("");
    setDescription("");
    setAddress("");
    setOrder(colleges.length);
    setIsActive(true);
    setImageFile(null);
    setImagePreview(null);
    setCurrentImageUrl(null);
    setCurrentPublicId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (col: CollegeItem) => {
    setEditingCollege(col);
    setName(col.name);
    setDescription(col.description);
    setAddress(col.address || "");
    setOrder(col.order);
    setIsActive(col.isActive);
    setImageFile(null);
    setImagePreview(null);
    setCurrentImageUrl(col.imageUrl);
    setCurrentPublicId(col.imagePublicId);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should be less than 5MB");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadToCloudinary = async (file: File): Promise<{ url: string; publicId: string }> => {
    setUploadProgress(10);
    // 1. Get signed params
    const sigRes = await fetch("/api/upload-signature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder: "prathi/colleges" }),
    });

    if (!sigRes.ok) {
      throw new Error("Could not acquire Cloudinary signature");
    }

    const { signature, timestamp, cloudName, apiKey, folder } = await sigRes.json();
    setUploadProgress(35);

    // 2. Upload directly to Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("folder", folder);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!uploadRes.ok) {
      throw new Error("Cloudinary upload failed");
    }

    setUploadProgress(90);
    const data = await uploadRes.json();
    return { url: data.secure_url, publicId: data.public_id };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("College name is required");
      return;
    }
    if (!description.trim()) {
      toast.error("College description is required");
      return;
    }

    setSubmitting(true);
    try {
      let finalImageUrl = currentImageUrl;
      let finalPublicId = currentPublicId;

      if (imageFile) {
        toast.info("Uploading image to Cloudinary...");
        const uploaded = await uploadToCloudinary(imageFile);
        finalImageUrl = uploaded.url;
        finalPublicId = uploaded.publicId;
      }

      if (editingCollege) {
        const res = await updateCollege(editingCollege.id, {
          name: name.trim(),
          description: description.trim(),
          address: address.trim() || undefined,
          order: Number(order),
          isActive,
          imageUrl: finalImageUrl || undefined,
          imagePublicId: finalPublicId || undefined,
        });

        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("College updated successfully! Public site updated.");
          setIsModalOpen(false);
          router.refresh();
        }
      } else {
        const res = await createCollege({
          name: name.trim(),
          description: description.trim(),
          address: address.trim() || undefined,
          order: Number(order),
          isActive,
          imageUrl: finalImageUrl || undefined,
          imagePublicId: finalPublicId || undefined,
        });

        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("College added successfully! Visible immediately on public site.");
          setIsModalOpen(false);
          router.refresh();
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save college. Please check your credentials and try again.");
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await deleteCollege(deleteTarget.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`"${deleteTarget.name}" and its courses have been deleted.`);
        setDeleteTarget(null);
        router.refresh();
      }
    } catch {
      toast.error("Failed to delete college.");
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
            <Building2 className="w-7 h-7 text-blue-900" />
            <span>Colleges Management</span>
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Add, configure, or reorder institutions under Prathvi Group of College
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New College</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search colleges by name or details..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
        />
      </div>

      {/* Colleges List */}
      {filteredColleges.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">
            {colleges.length === 0 ? "No Colleges Added Yet" : "No Matching Colleges"}
          </h3>
          <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
            {colleges.length === 0
              ? "Start by adding your first college to display it on the public website."
              : "Try adjusting your search query."}
          </p>
          {colleges.length === 0 && (
            <button
              onClick={openAddModal}
              className="mt-5 px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold text-sm inline-flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add First College</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredColleges.map((col) => (
            <div
              key={col.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
            >
              {/* College Card Image */}
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                {col.imageUrl ? (
                  <Image
                    src={col.imageUrl}
                    alt={col.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-slate-100 to-slate-200">
                    <Building2 className="w-12 h-12 text-gray-300 mb-1" />
                    <span className="text-xs font-semibold">No Image Uploaded</span>
                  </div>
                )}
                {/* Active Status Badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${
                      col.isActive
                        ? "bg-emerald-500/90 text-white"
                        : "bg-gray-800/90 text-gray-200"
                    }`}
                  >
                    {col.isActive ? <CheckCircle2 className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {col.isActive ? "Active" : "Hidden"}
                  </span>
                </div>
                {/* Order Badge */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-mono font-bold">
                  Order: {col.order}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-extrabold text-lg text-gray-900 leading-snug line-clamp-1">
                  {col.name}
                </h3>
                {col.address && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1.5 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{col.address}</span>
                  </div>
                )}
                <p className="text-gray-600 text-xs mt-2.5 line-clamp-2 leading-relaxed">
                  {col.description}
                </p>

                {/* Badges strip */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>{col._count.courses} Courses Offered</span>
                  </div>
                  <Link
                    href={`/admin/courses?collegeId=${col.id}`}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Manage Courses →
                  </Link>
                </div>

                {/* Actions row */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(col)}
                    className="p-2 text-gray-600 hover:text-blue-900 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                    title="Edit College"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(col)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete College"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <h2 className="font-extrabold text-lg text-gray-900">
                {editingCollege ? "Edit College" : "Add New College"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  College Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Prathvi Institute of Management & Technology"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Short Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the college, accreditations, or highlights..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Campus Address (Optional)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Vill. Khureri, Morar, Gwalior"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <span className="text-[11px] text-gray-400">Lower numbers appear first</span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Visibility
                  </label>
                  <label className="flex items-center gap-2.5 mt-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-5 h-5 rounded text-blue-900 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-gray-800">
                      Active on public site
                    </span>
                  </label>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Campus Banner Image
                </label>
                {(imagePreview || currentImageUrl) && (
                  <div className="relative h-36 w-full rounded-xl overflow-hidden mb-3 border border-gray-200 bg-slate-50">
                    <Image
                      src={imagePreview || currentImageUrl!}
                      alt="College preview"
                      fill
                      className="object-cover"
                    />
                    {imagePreview && (
                      <span className="absolute top-2 right-2 bg-blue-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        New Selected
                      </span>
                    )}
                  </div>
                )}
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 hover:border-blue-500 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-blue-50/30 transition-all">
                  <Upload className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs font-bold text-gray-700">
                    {imageFile ? imageFile.name : "Click to browse or drop image here"}
                  </span>
                  <span className="text-[11px] text-gray-400 mt-0.5">
                    JPG, PNG, WebP up to 5MB (Uploads securely to Cloudinary)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {uploadProgress !== null && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs text-blue-900 font-bold">
                      <span>Uploading image...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
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
                  <span>{submitting ? "Saving..." : editingCollege ? "Update College" : "Create College"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-gray-900">Delete College?</h3>
            <p className="text-gray-600 text-sm mt-2 leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-gray-900">{deleteTarget.name}</strong>?
            </p>
            <div className="mt-3 p-3 bg-red-50/70 border border-red-100 rounded-xl text-xs text-red-700 font-medium">
              ⚠️ <strong>Cascade Warning:</strong> This will also permanently delete all{" "}
              <strong>{deleteTarget._count.courses} course(s)</strong> offered under this college, as
              well as its banner image from Cloudinary.
            </div>

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
                <span>{submitting ? "Deleting..." : "Yes, Delete College"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
