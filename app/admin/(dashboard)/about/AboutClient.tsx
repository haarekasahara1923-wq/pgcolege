"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Info, Upload, Loader2, CheckCircle2, Eye } from "lucide-react";
import { toast } from "sonner";
import { updateAboutContent } from "@/actions/about-actions";

interface AboutContentItem {
  id: string;
  title: string;
  description: string;
  vision: string;
  mission: string;
  imageUrl: string | null;
  imagePublicId: string | null;
  updatedAt: Date;
}

interface AboutClientProps {
  initialAbout: AboutContentItem | null;
}

export default function AboutClient({ initialAbout }: AboutClientProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialAbout?.title || "Welcome to Prathvi Group of College");
  const [description, setDescription] = useState(initialAbout?.description || "");
  const [vision, setVision] = useState(initialAbout?.vision || "");
  const [mission, setMission] = useState(initialAbout?.mission || "");
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(
    initialAbout?.imageUrl || null
  );
  const [currentPublicId, setCurrentPublicId] = useState<string | null>(
    initialAbout?.imagePublicId || null
  );

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

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
    setUploadProgress(15);
    const sigRes = await fetch("/api/upload-signature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder: "prathi/about" }),
    });

    if (!sigRes.ok) {
      throw new Error("Could not acquire Cloudinary signature");
    }

    const { signature, timestamp, cloudName, apiKey, folder } = await sigRes.json();
    setUploadProgress(40);

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

    setUploadProgress(95);
    const data = await uploadRes.json();
    return { url: data.secure_url, publicId: data.public_id };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !vision.trim() || !mission.trim()) {
      toast.error("All text fields are required");
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

      const res = await updateAboutContent({
        title: title.trim(),
        description: description.trim(),
        vision: vision.trim(),
        mission: mission.trim(),
        imageUrl: finalImageUrl || undefined,
        imagePublicId: finalPublicId || undefined,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("About Us content updated successfully! Visible on public site.");
        if (finalImageUrl) setCurrentImageUrl(finalImageUrl);
        if (finalPublicId) setCurrentPublicId(finalPublicId);
        setImageFile(null);
        setImagePreview(null);
        router.refresh();
      }
    } catch {
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <Info className="w-7 h-7 text-blue-900" />
            <span>About Us Content</span>
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Customize the institutional profile, leadership message, vision, and mission displayed
            on /about
          </p>
        </div>
        <a
          href="/about"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-900 rounded-xl text-xs font-bold shadow-sm transition-colors self-start sm:self-auto"
        >
          <Eye className="w-4 h-4" />
          <span>View Public Page</span>
        </a>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Page Heading / Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Main Institutional Description *
            </label>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Comprehensive description about Prathvi Group of College, its inception, campus life, values, and pedagogical philosophy..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Our Vision *
              </label>
              <textarea
                required
                rows={4}
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                placeholder="Institutional vision statement..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Our Mission *
              </label>
              <textarea
                required
                rows={4}
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                placeholder="Institutional mission statement..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed"
              />
            </div>
          </div>

          {/* Banner Image */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Campus Banner Image (Optional)
            </label>
            {(imagePreview || currentImageUrl) && (
              <div className="relative h-48 w-full max-w-lg rounded-2xl overflow-hidden mb-3 border border-gray-200 bg-slate-50">
                <Image
                  src={imagePreview || currentImageUrl!}
                  alt="About Banner"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-gray-200 hover:border-blue-500 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-blue-50/30 transition-all max-w-lg">
              <Upload className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-xs font-bold text-gray-700">
                {imageFile ? imageFile.name : "Select or change about page banner image"}
              </span>
              <span className="text-[11px] text-gray-400 mt-0.5">
                JPG, PNG, WebP up to 5MB (Uploads to Cloudinary)
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            {uploadProgress !== null && (
              <div className="mt-2 space-y-1 max-w-lg">
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

          {/* Submit */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{submitting ? "Updating..." : "Save About Content"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
