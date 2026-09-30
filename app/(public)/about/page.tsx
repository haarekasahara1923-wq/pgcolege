import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { Eye, Target, GraduationCap, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us | Prathvi Group of College",
  description:
    "Learn about Prathvi Group of College – our vision, mission, leadership, and commitment to quality education in Gwalior, Madhya Pradesh.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const about = await prisma.aboutContent.findFirst();

  if (!about) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">About Content Coming Soon</h1>
          <p className="text-gray-500 text-sm mt-2">
            The administration is currently preparing our institutional profile. Please check back
            soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <section className="relative py-20 px-4 text-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2000&auto=format&fit=crop" alt="About Prathvi Group" fill className="object-cover object-center" priority />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-blue-900/80 to-slate-900/90" />
        </div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_0)] bg-[size:32px_32px] z-0" />
        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <span className="px-4 py-1.5 rounded-full bg-yellow-400/20 text-yellow-300 font-bold text-xs uppercase tracking-wider">
            Institutional Legacy
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{about.title}</h1>
          <p className="text-blue-200 text-sm sm:text-base font-medium max-w-2xl mx-auto">
            Vill. Khureri, Behind Devraj Hospital, Morar, Gwalior (Madhya Pradesh)
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {about.imageUrl && (
            <div className="relative h-80 sm:h-[460px] rounded-3xl overflow-hidden shadow-xl border border-gray-100">
              <Image
                src={about.imageUrl}
                alt="About Prathvi Group of College"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          )}
          <div className={about.imageUrl ? "" : "lg:col-span-2"}>
            <span className="text-xs font-black uppercase tracking-wider text-blue-900">
              Who We Are
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-1 mb-6">
              Committed to Educational Excellence &amp; Character Building
            </h2>
            <div className="text-gray-600 text-base leading-relaxed space-y-4 whitespace-pre-wrap font-normal">
              {about.description}
            </div>
          </div>
        </div>

        {/* Vision & Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {about.vision && (
            <div className="bg-gradient-to-br from-blue-50/80 to-blue-100/50 rounded-3xl p-8 border border-blue-200/80 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white flex items-center justify-center shadow-md">
                  <Eye className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-950">Our Vision</h3>
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    Future Aspirations
                  </span>
                </div>
              </div>
              <p className="text-blue-900/90 text-sm sm:text-base leading-relaxed whitespace-pre-wrap mt-2">
                {about.vision}
              </p>
            </div>
          )}

          {about.mission && (
            <div className="bg-gradient-to-br from-amber-50/80 to-amber-100/50 rounded-3xl p-8 border border-amber-200/80 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-950">Our Mission</h3>
                  <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                    Core Commitment
                  </span>
                </div>
              </div>
              <p className="text-amber-950/90 text-sm sm:text-base leading-relaxed whitespace-pre-wrap mt-2">
                {about.mission}
              </p>
            </div>
          )}
        </div>

        {/* Leadership Messages */}
        <div className="mt-16 sm:mt-24">
          <div className="text-center mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-blue-900">
              Our Leadership
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
              Messages from the Leaders
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Director Card */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-blue-900/5 relative">
                  <div className="absolute -top-6 -right-6 text-blue-50">
                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      {about.directorImageUrl ? (
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-100 relative">
                          <Image src={about.directorImageUrl} alt={about.directorName || "Director"} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 font-bold text-xl">
                          {(about.directorName || "D").charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{about.directorName || "Director"}</h3>
                        <p className="text-sm font-semibold text-blue-600">Director</p>
                      </div>
                    </div>
                  <p className="text-gray-600 text-base leading-relaxed whitespace-pre-wrap italic">
                    "{about.directorMessage || "Our director's message will be updated here shortly. We are deeply committed to providing the best education, modern facilities, and shaping the bright future of our students."}"
                  </p>
                </div>
              </div>
            
            {/* Principal Card */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-amber-900/5 relative">
                  <div className="absolute -top-6 -right-6 text-amber-50">
                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      {about.principalImageUrl ? (
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-100 relative">
                          <Image src={about.principalImageUrl} alt={about.principalName || "Principal"} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-900 font-bold text-xl">
                          {(about.principalName || "P").charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{about.principalName || "Principal"}</h3>
                        <p className="text-sm font-semibold text-amber-600">Principal</p>
                      </div>
                    </div>
                  <p className="text-gray-600 text-base leading-relaxed whitespace-pre-wrap italic">
                    "{about.principalMessage || "Our principal's message will be updated here shortly. We continuously strive to maintain discipline, foster academic excellence, and ensure the overall holistic development of every student."}"
                  </p>
                </div>
              </div>
          </div>
        </div>
      </section>
    </div>
  );
}
