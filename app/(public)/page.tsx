import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import {
  GraduationCap,
  BookOpen,
  Users,
  Award,
  ArrowRight,
  Building2,
  CheckCircle,
  Sparkles,
  PhoneCall,
  Play,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Home | Prathvi Group of College, Gwalior",
  description:
    "Prathvi Group of College offers premier higher education in Gwalior (MP). Explore MBA, B.Ed, D.Ed, Law, ITI Electrical, B.Pharma & D.Pharma programs.",
  alternates: { canonical: "/" },
};

async function getHomeData() {
  const [colleges, galleryItems, about, contact] = await Promise.all([
    prisma.college.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: { courses: { orderBy: { order: "asc" } } },
    }),
    prisma.galleryItem.findMany({
      take: 6,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
    prisma.aboutContent.findFirst(),
    prisma.contactDetails.findFirst(),
  ]);
  return { colleges, galleryItems, about, contact };
}

export default async function HomePage() {
  const { colleges, galleryItems, about, contact } = await getHomeData();
  const totalCourses = colleges.reduce((sum, c) => sum + c.courses.length, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Prathvi Group of College",
    description:
      "Premier group of 5 colleges in Gwalior, MP offering MBA, B.Ed, D.Ed, Law, ITI, B.Pharma, and D.Pharma courses.",
    address: {
      "@type": "PostalAddress",
      streetAddress: contact?.address || "Vill. Khureri, Behind Devraj Hospital, Morar",
      addressLocality: "Gwalior",
      addressRegion: "Madhya Pradesh",
      addressCountry: "IN",
    },
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://prathvigroup.edu.in",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden text-white">
        {/* Background Image & Overlays */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg.jpg"
            alt="Prathvi Group of College Campus"
            fill
            priority
            className="object-cover object-center scale-105 animate-[pulse_30s_ease-in-out_infinite_alternate]"
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/85 via-slate-900/80 to-blue-950/95" />
        </div>

        {/* Decorative Grid and Lighting */}
        <div
          className="absolute inset-0 opacity-15 z-0"
          style={{
            backgroundImage: "radial-gradient(circle at 1.5px 1.5px, #facc15 1px, transparent 0)",
            backgroundSize: "36px 36px",
          }}
        />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl pointer-events-none z-0" />
        <div className="absolute bottom-10 -right-20 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none z-0" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 mb-8 shadow-inner">
            <GraduationCap className="w-5 h-5 text-yellow-400" />
            <span className="text-blue-100 text-xs sm:text-sm font-semibold tracking-wide">
              Prathvi Group of College • Gwalior (M.P.)
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Empowering Minds.
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
              Shaping Future Leaders.
            </span>
          </h1>

          <p className="text-blue-100/90 text-base sm:text-xl max-w-3xl mx-auto mb-10 leading-relaxed font-light">
            A prestigious educational group with specialized colleges offering professional degree &amp;
            diploma programs in Management, Education, Law, Pharmacy, and Engineering.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/colleges"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-blue-950 rounded-2xl font-extrabold text-base shadow-lg shadow-yellow-400/25 hover:shadow-xl hover:shadow-yellow-400/35 transition-all duration-300 flex items-center justify-center gap-2.5 group"
            >
              <Building2 className="w-5 h-5" />
              <span>Explore Colleges</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/contact#enquire"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-2xl font-bold text-base backdrop-blur-md transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>Enquire Now</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Stats Strip */}
      <section className="bg-white border-y border-gray-100 py-10 shadow-sm relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center mb-3">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                {colleges.length}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mt-1">
                Institutions &amp; Colleges
              </div>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                {totalCourses}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mt-1">
                Academic Programs
              </div>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                5000+
              </div>
              <div className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mt-1">
                Students &amp; Alumni
              </div>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
                <Award className="w-6 h-6" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                100%
              </div>
              <div className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mt-1">
                Dedicated Placement
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Colleges Preview Cards */}
      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-900 font-bold text-xs uppercase tracking-wider">
              Our Institutions
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mt-3">
              Explore Our Member Colleges
            </h2>
            <p className="text-gray-600 text-base mt-3 leading-relaxed">
              Every college under Prathvi Group provides cutting-edge curriculum, experienced
              faculty, and modern laboratories to ensure student success.
            </p>
          </div>

          {colleges.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-lg mx-auto shadow-sm">
              <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Colleges Being Configured</h3>
              <p className="text-sm text-gray-500 mt-1">
                Administrative updates are in progress. Please check back shortly or enquire directly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {colleges.slice(0, 6).map((college) => (
                <div
                  key={college.id}
                  className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col group"
                >
                  <div className="relative h-52 w-full bg-gradient-to-br from-blue-950 to-blue-800 overflow-hidden">
                    {college.imageUrl ? (
                      <Image
                        src={college.imageUrl}
                        alt={college.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Building2 className="w-16 h-16 text-white/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                      <span className="px-3 py-1 bg-yellow-400 text-blue-950 text-xs font-black rounded-full shadow-md">
                        {college.courses.length} Courses
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors line-clamp-1">
                        {college.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                        {college.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <Link
                        href={`/colleges#${college.slug}`}
                        className="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform"
                      >
                        <span>View All Courses</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {colleges.length > 0 && (
            <div className="text-center mt-12">
              <Link
                href="/colleges"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-blue-950 hover:bg-blue-900 text-white font-bold text-sm shadow-md transition-all"
              >
                <span>View All Colleges &amp; Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Short About Snippet */}
      {about && (
        <section className="py-16 sm:py-24 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="px-3.5 py-1.5 rounded-full bg-yellow-400/20 text-yellow-800 font-bold text-xs uppercase tracking-wider">
                  About Our Institution
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                  {about.title}
                </h2>
                <p className="text-gray-600 text-base leading-relaxed line-clamp-4">
                  {about.description}
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Vision</h4>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{about.vision}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Mission</h4>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{about.mission}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 text-blue-900 font-bold text-sm hover:underline"
                  >
                    <span>Read Full Profile &amp; Leadership Message</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden shadow-xl bg-slate-100 border border-gray-200">
                {about.imageUrl ? (
                  <Image
                    src={about.imageUrl}
                    alt={about.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-blue-950 text-white p-8 text-center">
                    <GraduationCap className="w-16 h-16 text-yellow-400 mb-3" />
                    <h3 className="text-xl font-bold">Prathvi Group of College</h3>
                    <p className="text-xs text-blue-200 mt-1 max-w-sm">
                      Morar, Gwalior (Madhya Pradesh)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest Gallery Preview */}
      {galleryItems.length > 0 && (
        <section className="py-16 sm:py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
              <div>
                <span className="px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-900 font-bold text-xs uppercase tracking-wider">
                  Campus Life
                </span>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight mt-2">
                  Life at Prathvi Group
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Highlights from campus, laboratories, events, and student activities
                </p>
              </div>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-700 self-start sm:self-auto"
              >
                <span>View Full Gallery</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {galleryItems.map((item) => (
                <Link
                  key={item.id}
                  href="/gallery"
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-200 shadow-sm hover:shadow-md transition-all"
                >
                  <Image
                    src={item.url}
                    alt={item.title || "Campus Gallery"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                  {item.type === "VIDEO" && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white/90 text-blue-950 flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex items-end">
                    <span className="text-[11px] text-white font-semibold truncate">
                      {item.title || item.category || "Campus View"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Enquiry CTA Banner */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-blue-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Take the Next Step Towards Your Career
          </h2>
          <p className="text-base sm:text-lg text-blue-950/80 font-medium max-w-2xl mx-auto">
            Admissions are open for current academic sessions. Contact our counsellors for
            eligibility, fees, and scholarship guidance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/contact#enquire"
              className="w-full sm:w-auto px-8 py-4 bg-blue-950 hover:bg-blue-900 text-white rounded-2xl font-extrabold text-base shadow-lg transition-all"
            >
              Submit an Online Enquiry
            </Link>
            <Link
              href="/colleges"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-blue-950 rounded-2xl font-bold text-base shadow-md transition-all"
            >
              Browse All Courses
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
