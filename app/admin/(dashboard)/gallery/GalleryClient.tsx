"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Image as ImageIcon,
  Video,
  Upload,
  Plus,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Film,
  Tag,
  Eye,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { createGalleryItem, deleteGalleryItem } from "@/actions/gallery-actions";

interface GalleryItemType {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  publicId: string | null;
  youtubeUrl: string | null;
  title: string | null;
  category: string | null;
  order: number;
  createdAt: Date;
}

interface GalleryClientProps {
  initialItems: GalleryItemType[];
}

interface UploadQueueItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: "IMAGE" | "VIDEO";
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

export default function GalleryClient({ initialItems }: GalleryClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<GalleryItemType[]>(initialItems);
  const [activeTab, setActiveTab] = useState<"ALL" | "IMAGE" | "VIDEO">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // Multi-upload state
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("Campus");
  const [uploadTitle, setUploadTitle] = useState("");

  // YouTube modal state
  const [isYoutubeModalOpen, setIsYoutubeModalOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeTitle, setYoutubeTitle] = useState("");
  const [youtubeCategory, setYoutubeCategory] = useState("Events");
  const [submittingYoutube, setSubmittingYoutube] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<GalleryItemType | null>(null);
  const [deleting, setDeleting] = useState(false);

  const categories = Array.from(
    new Set(items.map((i) => i.category).filter(Boolean) as string[])
  );

  const filteredItems = items.filter((item) => {
    const matchesTab = activeTab === "ALL" || item.type === activeTab;
    const matchesCategory = categoryFilter === "ALL" || item.category === categoryFilter;
    return matchesTab && matchesCategory;
  });

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newQueueItems: UploadQueueItem[] = [];

    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        toast.error(`"${file.name}" is not a supported image or video format.`);
        return;
      }

      if (isImage && file.size > 10 * 1024 * 1024) {
        toast.error(`Image "${file.name}" exceeds 10MB limit.`);
        return;
      }

      if (isVideo && file.size > 60 * 1024 * 1024) {
        toast.error(`Video "${file.name}" exceeds 60MB limit.`);
        return;
      }

      newQueueItems.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        name: file.name,
        size: file.size,
        type: isVideo ? "VIDEO" : "IMAGE",
        progress: 0,
        status: "pending",
      });
    });

    setQueue((prev) => [...prev, ...newQueueItems]);
  };

  const startBatchUpload = async () => {
    if (queue.length === 0 || isUploading) return;
    setIsUploading(true);

    const pendingItems = queue.filter((q) => q.status === "pending");

    for (const queueItem of pendingItems) {
      try {
        setQueue((prev) =>
          prev.map((q) => (q.id === queueItem.id ? { ...q, status: "uploading", progress: 15 } : q))
        );

        const resourceType = queueItem.type === "VIDEO" ? "video" : "image";

        // 1. Get signed signature
        const sigRes = await fetch("/api/upload-signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder: "prathi/gallery", resourceType }),
        });

        if (!sigRes.ok) throw new Error("Could not acquire upload signature");

        const { signature, timestamp, cloudName, apiKey, folder } = await sigRes.json();

        setQueue((prev) =>
          prev.map((q) => (q.id === queueItem.id ? { ...q, progress: 45 } : q))
        );

        // 2. Direct upload to Cloudinary
        const formData = new FormData();
        formData.append("file", queueItem.file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", folder);
        if (resourceType === "video") {
          formData.append("resource_type", "video");
        }

        const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

        const uploadRes = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Cloudinary upload failed");

        setQueue((prev) =>
          prev.map((q) => (q.id === queueItem.id ? { ...q, progress: 85 } : q))
        );

        const data = await uploadRes.json();

        // 3. Save to database via server action
        await createGalleryItem({
          type: queueItem.type,
          url: data.secure_url,
          publicId: data.public_id,
          title: uploadTitle || queueItem.name.replace(/\.[^/.]+$/, ""),
          category: uploadCategory || "General",
          order: 0,
        });

        setQueue((prev) =>
          prev.map((q) => (q.id === queueItem.id ? { ...q, status: "done", progress: 100 } : q))
        );
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Upload error";
        setQueue((prev) =>
          prev.map((q) => (q.id === queueItem.id ? { ...q, status: "error", error: errorMsg } : q))
        );
      }
    }

    setIsUploading(false);
    toast.success("Upload queue completed! Gallery refreshed.");
    router.refresh();
  };

  const handleAddYoutube = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) {
      toast.error("YouTube URL is required");
      return;
    }

    // Extract embeddable or standard YouTube url
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = youtubeUrl.match(regExp);

    if (!match || match[2].length !== 11) {
      toast.error("Please enter a valid YouTube video URL");
      return;
    }

    const videoId = match[2];
    const standardizedUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    setSubmittingYoutube(true);
    try {
      const res = await createGalleryItem({
        type: "VIDEO",
        url: thumbnailUrl,
        youtubeUrl: standardizedUrl,
        title: youtubeTitle.trim() || "YouTube Video",
        category: youtubeCategory.trim() || "Events",
        order: 0,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("YouTube video added successfully to gallery!");
        setIsYoutubeModalOpen(false);
        setYoutubeUrl("");
        setYoutubeTitle("");
        router.refresh();
      }
    } catch {
      toast.error("Failed to add YouTube video");
    } finally {
      setSubmittingYoutube(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await deleteGalleryItem(deleteTarget.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Asset removed from gallery and Cloudinary.");
        setDeleteTarget(null);
        router.refresh();
      }
    } catch {
      toast.error("Failed to delete gallery item");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <ImageIcon className="w-7 h-7 text-blue-900" />
            <span>Gallery & Media Manager</span>
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Multi-file drag &amp; drop uploader for campus photos, videos, and YouTube features
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsYoutubeModalOpen(true)}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Film className="w-4 h-4" />
            <span>Add YouTube Link</span>
          </button>
          <a
            href="/gallery"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:text-blue-900 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>View Public Gallery</span>
          </a>
        </div>
      </div>

      {/* Multi-file Upload Box */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-5">
        <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-900" />
          <span>Upload Images &amp; Videos (Multi-file)</span>
        </h2>

        {/* Category & Title Inputs for batch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Category Tag
            </label>
            <input
              type="text"
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              placeholder="e.g. Campus, Events, Labs, Sports, Pharmacy Lab"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Title Prefix / Description (Optional)
            </label>
            <input
              type="text"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="e.g. Annual Convocation Ceremony"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFilesSelected(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-blue-200 hover:border-blue-600 rounded-2xl p-8 text-center cursor-pointer bg-blue-50/40 hover:bg-blue-50/70 transition-all flex flex-col items-center justify-center group"
        >
          <div className="w-14 h-14 rounded-2xl bg-white text-blue-900 shadow-md flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Upload className="w-7 h-7" />
          </div>
          <p className="text-sm font-bold text-gray-900">
            Click to browse or drag and drop files here
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supports multiple images (JPG, PNG, WebP) and MP4/WebM videos
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => handleFilesSelected(e.target.files)}
            className="hidden"
          />
        </div>

        {/* Queue List */}
        {queue.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Upload Queue ({queue.length} files)
              </span>
              {!isUploading && (
                <button
                  onClick={() => setQueue([])}
                  className="text-xs text-gray-400 hover:text-red-600 cursor-pointer"
                >
                  Clear Queue
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 border border-gray-200 rounded-xl flex items-center gap-3 text-xs"
                >
                  {item.type === "VIDEO" ? (
                    <Film className="w-5 h-5 text-amber-600 shrink-0" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-blue-600 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{item.name}</div>
                    <div className="text-[11px] text-gray-400">
                      {(item.size / 1024 / 1024).toFixed(2)} MB â€¢ {item.type}
                    </div>
                  </div>

                  {item.status === "uploading" && (
                    <div className="flex items-center gap-2 w-32">
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full transition-all duration-150"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-blue-900">{item.progress}%</span>
                    </div>
                  )}

                  {item.status === "done" && (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Uploaded</span>
                    </span>
                  )}

                  {item.status === "error" && (
                    <span className="text-red-500 font-bold text-[11px]">
                      Failed: {item.error}
                    </span>
                  )}

                  {item.status === "pending" && !isUploading && (
                    <button
                      onClick={() => setQueue(queue.filter((q) => q.id !== item.id))}
                      className="p-1 text-gray-400 hover:text-red-600 rounded cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={startBatchUpload}
                disabled={isUploading || queue.filter((q) => q.status === "pending").length === 0}
                className="px-6 py-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {isUploading
                    ? "Uploading to Cloudinary..."
                    : `Upload ${queue.filter((q) => q.status === "pending").length} Files`}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Type tabs */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-gray-200 shadow-sm self-start">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "ALL" ? "bg-blue-950 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All Media ({items.length})
          </button>
          <button
            onClick={() => setActiveTab("IMAGE")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "IMAGE" ? "bg-blue-950 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Photos ({items.filter((i) => i.type === "IMAGE").length})
          </button>
          <button
            onClick={() => setActiveTab("VIDEO")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "VIDEO" ? "bg-blue-950 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Videos ({items.filter((i) => i.type === "VIDEO").length})
          </button>
        </div>

        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Gallery Media Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-gray-400 flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-gray-800">No Gallery Items Found</h3>
          <p className="text-xs text-gray-500 mt-1">
            Upload images, videos, or add YouTube links above to populate your gallery.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col relative"
            >
              {/* Media Preview Box */}
              <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                {item.type === "IMAGE" ? (
                  <Image
                    src={item.url}
                    alt={item.title || "Gallery"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                  />
                ) : item.youtubeUrl ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={item.url}
                      alt={item.title || "YouTube video"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                        <Film className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <video src={item.url} className="w-full h-full object-cover" muted />
                )}

                {/* Badge for Type */}
                <div className="absolute top-2 left-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-sm ${
                      item.youtubeUrl
                        ? "bg-red-600"
                        : item.type === "VIDEO"
                        ? "bg-amber-600"
                        : "bg-blue-600"
                    }`}
                  >
                    {item.youtubeUrl ? "YouTube" : item.type === "VIDEO" ? "Video" : "Photo"}
                  </span>
                </div>

                {/* Delete button hover overlay */}
                <button
                  onClick={() => setDeleteTarget(item)}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-md cursor-pointer"
                  title="Delete media"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Title & Category caption */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs text-gray-900 truncate" title={item.title || ""}>
                    {item.title || "Untitled Asset"}
                  </h4>
                  {item.category && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 font-semibold mt-0.5">
                      <Tag className="w-2.5 h-2.5 text-gray-400" />
                      <span>{item.category}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* YouTube Modal */}
      {isYoutubeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                <Film className="w-5 h-5 text-red-600" />
                <span>Add YouTube Video</span>
              </h2>
              <button
                onClick={() => setIsYoutubeModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddYoutube} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  YouTube Video URL *
                </label>
                <input
                  type="text"
                  required
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Video Title (Optional)
                </label>
                <input
                  type="text"
                  value={youtubeTitle}
                  onChange={(e) => setYoutubeTitle(e.target.value)}
                  placeholder="e.g. Annual Sports Meet 2026 Highlights"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Category Tag
                </label>
                <input
                  type="text"
                  value={youtubeCategory}
                  onChange={(e) => setYoutubeCategory(e.target.value)}
                  placeholder="e.g. Events, Campus Tour, Seminar"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsYoutubeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingYoutube}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer"
                >
                  {submittingYoutube && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submittingYoutube ? "Adding..." : "Add Video"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Delete Gallery Item?</h3>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              This will remove this asset from the public gallery and permanently delete it from
              Cloudinary storage.
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
