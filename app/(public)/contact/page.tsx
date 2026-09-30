import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
} from "lucide-react";
import EnquiryForm from "@/components/public/EnquiryForm";

// Inline SVG social icons (not in lucide-react v1.49)
const SocialIcons: Record<string, React.FC<{ className?: string }>> = {
  Facebook: ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  ),
  Instagram: ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
    </svg>
  ),
  YouTube: ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 01-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 01-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 011.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418zM15.194 12l-5.194 3V9l5.194 3z" clipRule="evenodd" />
    </svg>
  ),
  Twitter: ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  LinkedIn: ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
};
import React from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us | Prathvi Group of College",
  description:
    "Get in touch with Prathvi Group of College, Morar, Gwalior (MP). Reach our admissions desk, find directions, or submit an admission enquiry.",
  alternates: { canonical: "/contact" },
};

async function getContactData() {
  const [contact, colleges] = await Promise.all([
    prisma.contactDetails.findFirst(),
    prisma.college.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: { 
        id: true, 
        name: true, 
        courses: { orderBy: { order: "asc" }, select: { id: true, name: true } }
      },
    }),
  ]);
  return { contact, colleges };
}

export default async function ContactPage() {
  const { contact, colleges } = await getContactData();

  const socialLinks = [
    { href: contact?.facebook, iconKey: "Facebook", label: "Facebook" },
    { href: contact?.instagram, iconKey: "Instagram", label: "Instagram" },
    { href: contact?.youtube, iconKey: "YouTube", label: "YouTube" },
    { href: contact?.twitter, iconKey: "Twitter", label: "Twitter" },
    { href: contact?.linkedin, iconKey: "LinkedIn", label: "LinkedIn" },
  ].filter((s) => s.href);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative py-16 px-4 text-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/contact-hero.jpg" alt="Contact Prathvi Group" fill className="object-cover object-center" priority />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-blue-900/80 to-slate-900/90" />
        </div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_0)] bg-[size:32px_32px] z-0" />
        <div className="relative z-10 max-w-4xl mx-auto space-y-3">
          <span className="px-4 py-1.5 rounded-full bg-yellow-400/20 text-yellow-300 font-bold text-xs uppercase tracking-wider">
            Admissions Desk
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Contact Us</h1>
          <p className="text-blue-200 text-sm sm:text-base font-medium max-w-xl mx-auto">
            Our admissions team and academic counsellors are available to assist you.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Campus Info & Maps */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-black text-gray-900">Campus Information</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Visit us in person or reach our administrative offices
                </p>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center shrink-0 shadow-sm">
                  <MapPin className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Campus Address</h3>
                  <p className="text-gray-600 text-xs sm:text-sm mt-0.5 leading-relaxed">
                    {contact?.address ||
                      "Vill. Khureri, Behind Devraj Hospital, Morar, Gwalior (Madhya Pradesh)"}
                  </p>
                </div>
              </div>

              {/* Phones */}
              {contact?.phones && contact.phones.length > 0 && (
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 shadow-sm">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Admission Helplines</h3>
                    <div className="space-y-0.5 mt-0.5">
                      {contact.phones.map((phone, i) => (
                        <a
                          key={i}
                          href={`tel:${phone}`}
                          className="block text-gray-600 hover:text-blue-900 text-xs sm:text-sm font-medium transition-colors"
                        >
                          {phone}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* WhatsApp direct */}
              {contact?.whatsappNumber && (
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                    <MessageCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">WhatsApp Counselling</h3>
                    <a
                      href={`https://wa.me/${contact.whatsappNumber.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-emerald-600 font-bold hover:underline mt-0.5"
                    >
                      <span>+{contact.whatsappNumber} (Chat Now)</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Emails */}
              {contact?.emails && contact.emails.length > 0 && (
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 shadow-sm">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Official Email</h3>
                    <div className="space-y-0.5 mt-0.5">
                      {contact.emails.map((email, i) => (
                        <a
                          key={i}
                          href={`mailto:${email}`}
                          className="block text-gray-600 hover:text-blue-900 text-xs sm:text-sm font-medium transition-colors"
                        >
                          {email}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Working Hours */}
              {contact?.workingHours && (
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 shadow-sm">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Office Hours</h3>
                    <p className="text-gray-600 text-xs sm:text-sm mt-0.5">
                      {contact.workingHours}
                    </p>
                  </div>
                </div>
              )}

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
                    Connect With Us
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                  {socialLinks.map(({ href, iconKey, label }) => {
                      const Icon = SocialIcons[iconKey];
                      return (
                        <a
                          key={label}
                          href={href || undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-blue-950 hover:text-white text-gray-600 flex items-center justify-center transition-colors shadow-sm"
                          title={label}
                        >
                          {Icon && <Icon className="w-4 h-4" />}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Google Maps Embed */}
            {contact?.mapEmbedUrl && (
              <div className="bg-white rounded-3xl p-2 border border-gray-200/80 shadow-sm overflow-hidden h-72">
                <iframe
                  src={contact.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: "1.25rem" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Campus Map Location"
                />
              </div>
            )}
          </div>

          {/* Right Column: Enquiry Form */}
          <div id="enquire" className="scroll-mt-24">
            <div id="enquiry">
              <EnquiryForm
                colleges={colleges}
                whatsappNumber={contact?.whatsappNumber || undefined}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
