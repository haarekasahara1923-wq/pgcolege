"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Share2,
  Plus,
  Trash2,
  Loader2,
  Eye,
  CheckCircle2,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { updateContactDetails } from "@/actions/contact-actions";

interface ContactDetailsItem {
  id: string;
  address: string;
  phones: string[];
  emails: string[];
  whatsappNumber: string | null;
  whatsappGreeting: string;
  workingHours: string;
  mapEmbedUrl: string | null;
  facebook: string | null;
  instagram: string | null;
  youtube: string | null;
  twitter: string | null;
  linkedin: string | null;
  logoUrl: string | null;
  logoPublicId: string | null;
  updatedAt: Date;
}

interface ContactClientProps {
  initialContact: ContactDetailsItem | null;
}

export default function ContactClient({ initialContact }: ContactClientProps) {
  const router = useRouter();

  const [address, setAddress] = useState(
    initialContact?.address ||
      "Vill. Khureri, Behind Devraj Hospital, Morar, Gwalior (Madhya Pradesh)"
  );
  const [phones, setPhones] = useState<string[]>(
    initialContact?.phones && initialContact.phones.length > 0
      ? initialContact.phones
      : ["+91 94251 12345"]
  );
  const [emails, setEmails] = useState<string[]>(
    initialContact?.emails && initialContact.emails.length > 0
      ? initialContact.emails
      : ["info@prathvigroup.edu.in"]
  );
  const [whatsappNumber, setWhatsappNumber] = useState(initialContact?.whatsappNumber || "919425112345");
  const [whatsappGreeting, setWhatsappGreeting] = useState(
    initialContact?.whatsappGreeting ||
      "Hello Prathvi Group of College, I would like to know more about your courses."
  );
  const [workingHours, setWorkingHours] = useState(
    initialContact?.workingHours || "Monday - Saturday: 9:00 AM - 5:00 PM"
  );
  const [mapEmbedUrl, setMapEmbedUrl] = useState(initialContact?.mapEmbedUrl || "");
  const [facebook, setFacebook] = useState(initialContact?.facebook || "");
  const [instagram, setInstagram] = useState(initialContact?.instagram || "");
  const [youtube, setYoutube] = useState(initialContact?.youtube || "");
  const [twitter, setTwitter] = useState(initialContact?.twitter || "");
  const [linkedin, setLinkedin] = useState(initialContact?.linkedin || "");

  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(initialContact?.logoUrl || null);
  const [currentLogoPublicId, setCurrentLogoPublicId] = useState<string | null>(initialContact?.logoPublicId || null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, WebP)");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo file size should be less than 2MB");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const uploadToCloudinary = async (file: File): Promise<{ url: string; publicId: string }> => {
    setUploadProgress(15);
    const sigRes = await fetch("/api/upload-signature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder: "prathi/site" }),
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

  // Phone handlers
  const addPhone = () => setPhones([...phones, ""]);
  const removePhone = (idx: number) => {
    if (phones.length <= 1) return;
    setPhones(phones.filter((_, i) => i !== idx));
  };
  const updatePhone = (idx: number, val: string) => {
    const next = [...phones];
    next[idx] = val;
    setPhones(next);
  };

  // Email handlers
  const addEmail = () => setEmails([...emails, ""]);
  const removeEmail = (idx: number) => {
    if (emails.length <= 1) return;
    setEmails(emails.filter((_, i) => i !== idx));
  };
  const updateEmail = (idx: number, val: string) => {
    const next = [...emails];
    next[idx] = val;
    setEmails(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validPhones = phones.map((p) => p.trim()).filter(Boolean);
    const validEmails = emails.map((m) => m.trim()).filter(Boolean);

    if (!address.trim()) {
      toast.error("Address is required");
      return;
    }
    if (validPhones.length === 0) {
      toast.error("At least one phone number is required");
      return;
    }
    if (validEmails.length === 0) {
      toast.error("At least one email address is required");
      return;
    }

    setSubmitting(true);
    try {
      let finalLogoUrl = currentLogoUrl;
      let finalLogoPublicId = currentLogoPublicId;

      if (logoFile) {
        toast.info("Uploading logo...");
        const uploaded = await uploadToCloudinary(logoFile);
        finalLogoUrl = uploaded.url;
        finalLogoPublicId = uploaded.publicId;
      }

      const res = await updateContactDetails({
        address: address.trim(),
        phones: validPhones,
        emails: validEmails,
        whatsappNumber: whatsappNumber.trim() || undefined,
        whatsappGreeting: whatsappGreeting.trim(),
        workingHours: workingHours.trim() || undefined,
        mapEmbedUrl: mapEmbedUrl.trim() || undefined,
        facebook: facebook.trim() || undefined,
        instagram: instagram.trim() || undefined,
        youtube: youtube.trim() || undefined,
        twitter: twitter.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
        logoUrl: finalLogoUrl || undefined,
        logoPublicId: finalLogoPublicId || undefined,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(
          "Contact details & Logo updated successfully! Visible on public site."
        );
        if (finalLogoUrl) setCurrentLogoUrl(finalLogoUrl);
        if (finalLogoPublicId) setCurrentLogoPublicId(finalLogoPublicId);
        setLogoFile(null);
        setLogoPreview(null);
        router.refresh();
      }
    } catch {
      toast.error("Failed to update contact details. Please try again.");
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
            <Phone className="w-7 h-7 text-blue-900" />
            <span>Contact & WhatsApp Details</span>
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manage campus address, contact numbers, email addresses, floating WhatsApp widget settings,
            and social profiles
          </p>
        </div>
        <a
          href="/contact"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-900 rounded-xl text-xs font-bold shadow-sm transition-colors self-start sm:self-auto"
        >
          <Eye className="w-4 h-4" />
          <span>View Public Contact</span>
        </a>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
          {/* Section 1: Logo Upload */}
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-blue-950 flex items-center gap-2 border-b border-gray-100 pb-2">
              <ImageIcon className="w-5 h-5 text-blue-900" />
              <span>Site Logo (512x512px recommended)</span>
            </h2>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-full sm:w-1/3">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Current Logo
                </label>
                {(logoPreview || currentLogoUrl) ? (
                  <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm flex items-center justify-center p-2">
                    <Image
                      src={logoPreview || currentLogoUrl!}
                      alt="Site Logo"
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-gray-200 bg-slate-50 flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs font-medium">No Logo</span>
                  </div>
                )}
              </div>
              <div className="w-full sm:w-2/3">
                <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-gray-200 hover:border-blue-500 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-blue-50/30 transition-all">
                  <Upload className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs font-bold text-gray-700 text-center">
                    {logoFile ? logoFile.name : "Select or change site logo"}
                  </span>
                  <span className="text-[11px] text-gray-400 mt-0.5 text-center">
                    Recommended size: 512x512px. JPG, PNG, WebP up to 2MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
                {uploadProgress !== null && (
                  <div className="mt-2 space-y-1 w-full">
                    <div className="flex justify-between text-xs text-blue-900 font-bold">
                      <span>Uploading logo...</span>
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
            </div>
          </div>

          {/* Section 2: Campus Address & Hours */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-base font-extrabold text-blue-950 flex items-center gap-2 border-b border-gray-100 pb-2">
              <MapPin className="w-5 h-5 text-blue-900" />
              <span>Campus Address & Schedule</span>
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Official Campus Address *
              </label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Working / Office Hours
              </label>
              <input
                type="text"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                placeholder="e.g. Monday - Saturday: 9:00 AM - 5:00 PM"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Section 2: WhatsApp Settings */}
          <div className="space-y-4 p-5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl">
            <h2 className="text-base font-extrabold text-emerald-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-700" />
              <span>Floating WhatsApp Configuration</span>
            </h2>
            <p className="text-xs text-emerald-800 leading-relaxed">
              These settings control the floating WhatsApp widget on every public page, as well as the
              direct WhatsApp enquire buttons on college cards.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-950 mb-1.5">
                  Admin WhatsApp Number (International format, no +)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                    +
                  </span>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="919425112345"
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-emerald-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <span className="text-[11px] text-emerald-700 mt-1 block">
                  Example: 919425112345 (country code 91 + 10-digit number)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-950 mb-1.5">
                  Default WhatsApp Greeting Message *
                </label>
                <input
                  type="text"
                  required
                  value={whatsappGreeting}
                  onChange={(e) => setWhatsappGreeting(e.target.value)}
                  placeholder="Hello Prathvi Group of College, I would like to know more."
                  className="w-full px-4 py-2.5 bg-white border border-emerald-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <span className="text-[11px] text-emerald-700 mt-1 block">
                  Used when visitor clicks &ldquo;Skip form, chat directly&rdquo;
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Phone Numbers and Emails */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Phones */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>Contact Phone Numbers *</span>
                </label>
                <button
                  type="button"
                  onClick={addPhone}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Phone</span>
                </button>
              </div>
              {phones.map((phone, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => updatePhone(idx, e.target.value)}
                    placeholder="+91 94251 12345"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {phones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhone(idx)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Emails */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-amber-600" />
                  <span>Contact Email Addresses *</span>
                </label>
                <button
                  type="button"
                  onClick={addEmail}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Email</span>
                </button>
              </div>
              {emails.map((email, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => updateEmail(idx, e.target.value)}
                    placeholder="admissions@prathvigroup.edu.in"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {emails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmail(idx)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Google Maps & Social Links */}
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-blue-950 flex items-center gap-2 border-b border-gray-100 pb-2">
              <Share2 className="w-5 h-5 text-blue-900" />
              <span>Map Embed & Social Profiles</span>
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Google Maps Embed URL (iframe src)
              </label>
              <input
                type="text"
                value={mapEmbedUrl}
                onChange={(e) => setMapEmbedUrl(e.target.value)}
                placeholder="https://www.google.com/maps/embed?pb=..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Facebook URL</label>
                <input
                  type="text"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/prathvigroup"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Instagram URL</label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/prathvigroup"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">YouTube Channel URL</label>
                <input
                  type="text"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="https://youtube.com/@prathvigroup"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Twitter / X URL</label>
                <input
                  type="text"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="https://twitter.com/prathvigroup"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/school/prathvigroup"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{submitting ? "Updating..." : "Save Contact & WhatsApp Details"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
