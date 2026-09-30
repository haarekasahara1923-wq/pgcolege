"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Send, MessageCircle, Loader2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  collegeId: z.string().optional(),
  courseId: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  honeypot: z.string().max(0).optional(),
});

type FormData = z.infer<typeof schema>;

interface College {
  id: string;
  name: string;
  courses: { id: string; name: string }[];
}

interface EnquiryFormProps {
  colleges?: College[];
  whatsappNumber?: string | null;
}

export default function EnquiryForm({ colleges = [], whatsappNumber }: EnquiryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const selectedCollegeId = watch("collegeId");
  const selectedCourseId = watch("courseId");
  const nameVal = watch("name");
  const phoneVal = watch("phone");
  const selectedCollege = colleges.find((c) => c.id === selectedCollegeId);

  const submitToDb = async (data: FormData, source: "FORM" | "WHATSAPP" = "FORM") => {
    const res = await fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, source }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Submission failed");
    }
    return res.json();
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await submitToDb(data, "FORM");
      setSubmitted(true);
      toast.success("Enquiry submitted successfully! We will contact you soon.");
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsApp = async () => {
    const values = watch();
    const valid = schema.safeParse(values);
    if (!valid.success) {
      toast.error("Please fill in all required fields correctly first.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitToDb(valid.data, "WHATSAPP");
      const college = colleges.find((c) => c.id === valid.data.collegeId);
      const course = college?.courses.find((c) => c.id === valid.data.courseId);
      const collegeName = college?.name;
      const courseName = course?.name;

      let msg = `Hello Prathvi Group of College, I am ${valid.data.name}. Mobile: ${valid.data.phone}.`;
      if (collegeName && courseName) msg += ` I am interested in ${collegeName} - ${courseName}.`;
      else if (collegeName) msg += ` I am interested in ${collegeName}.`;
      if (valid.data.message) msg += ` ${valid.data.message}`;

      const wa = whatsappNumber;
      if (wa) {
        window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, "_blank");
      }
      setSubmitted(true);
      toast.success("Enquiry saved! Opening WhatsApp...");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Send className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
        <p className="text-gray-600 mb-6">Your enquiry has been received. We will get back to you shortly.</p>
        <button onClick={() => setSubmitted(false)}
          className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          Send Another Enquiry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-blue-900 mb-2">Send an Enquiry</h2>
      <p className="text-gray-500 text-sm mb-6">Fill in the form and we will respond within 24 hours.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Honeypot - hidden from real users */}
        <input {...register("honeypot")} type="text" tabIndex={-1} autoComplete="off"
          className="hidden" aria-hidden="true" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="enq-name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input id="enq-name" {...register("name")} placeholder="Your full name"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="enq-phone" className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input id="enq-phone" {...register("phone")} placeholder="10-digit mobile number" maxLength={10}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="enq-email" className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
          <input id="enq-email" {...register("email")} type="email" placeholder="your@email.com"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        {colleges.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="enq-college" className="block text-sm font-medium text-gray-700 mb-1">College (optional)</label>
              <select id="enq-college" {...register("collegeId")}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select a college</option>
                {colleges.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {selectedCollege && (
              <div>
                <label htmlFor="enq-course" className="block text-sm font-medium text-gray-700 mb-1">Course (optional)</label>
                <select id="enq-course" {...register("courseId")}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select a course</option>
                  {selectedCollege.courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
          </div>
        )}

        <div>
          <label htmlFor="enq-message" className="block text-sm font-medium text-gray-700 mb-1">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea id="enq-message" {...register("message")} rows={4}
            placeholder="Tell us what you would like to know..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button type="submit" disabled={isSubmitting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-semibold transition-colors disabled:opacity-50">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit Enquiry
          </button>
          {whatsappNumber && (
            <button type="button" onClick={handleWhatsApp} disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl font-semibold transition-colors disabled:opacity-50">
              <MessageCircle className="w-4 h-4" />
              Send via WhatsApp
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
