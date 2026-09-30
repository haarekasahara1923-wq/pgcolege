"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Building2, Search, Clock, MessageCircle, BookOpen } from "lucide-react";

interface Course {
  id: string;
  name: string;
  duration: string;
  description?: string | null;
  eligibility?: string | null;
}

interface College {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string | null;
  address?: string | null;
  courses: Course[];
}

export default function CollegesPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/colleges")
      .then((r) => r.json())
      .then((data) => { setColleges(data.colleges || []); setWhatsappNumber(data.whatsappNumber); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = colleges.filter((c) => {
    const matchFilter = filter === "all" || c.id === filter;
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.courses.some((course) => course.name.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  const openWA = (collegeName: string, courseName?: string) => {
    if (!whatsappNumber) return;
    let msg = `Hello Prathvi Group of College, I am interested in ${collegeName}`;
    if (courseName) msg += ` - ${courseName}`;
    msg += `. Please send me more details.`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative py-16 px-4 text-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/colleges-hero.jpg" alt="Colleges & Courses" fill className="object-cover object-center" priority />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 to-blue-800/80" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Colleges & Courses</h1>
          <p className="text-blue-200 text-lg">Explore our diverse range of professional courses</p>
        </div>
      </section>

      {/* Filter & Search */}
      <section className="sticky top-16 lg:top-20 z-30 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search colleges or courses..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === "all" ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                All Colleges
              </button>
              {colleges.map((c) => (
                <button key={c.id} onClick={() => setFilter(c.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === c.id ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Colleges */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-48 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-500">
                {colleges.length === 0 ? "No colleges added yet" : "No results found"}
              </h2>
              <p className="text-gray-400 mt-2">
                {colleges.length === 0 ? "The admin panel is being set up." : "Try a different search or filter."}
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {filtered.map((college) => (
                <div key={college.id} id={college.slug}
                  className="bg-white rounded-2xl shadow-md overflow-hidden">
                  {/* College Header */}
                  <div className="relative h-48 sm:h-64 bg-gradient-to-br from-blue-800 to-blue-600">
                    {college.imageUrl && (
                      <Image src={college.imageUrl} alt={college.name} fill className="object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent flex items-end p-6">
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">{college.name}</h2>
                        {college.address && <p className="text-blue-200 text-sm">{college.address}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-gray-600 mb-6">{college.description}</p>

                    {college.courses.length > 0 ? (
                      <>
                        <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                          <BookOpen className="w-5 h-5" />
                          Courses Offered
                        </h3>
                        {/* Desktop Table */}
                        <div className="hidden sm:block overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-blue-50">
                                <th className="text-left px-4 py-3 text-sm font-semibold text-blue-900 rounded-tl-lg">Course Name</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-blue-900">Duration</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-blue-900 rounded-tr-lg">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {college.courses.map((course) => (
                                <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-4 py-3">
                                    <div className="font-medium text-gray-900">{course.name}</div>
                                    {course.eligibility && (
                                      <div className="text-xs text-gray-500 mt-0.5">Eligibility: {course.eligibility}</div>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                                      <Clock className="w-3.5 h-3.5" />
                                      {course.duration}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <button
                                      onClick={() => openWA(college.name, course.name)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white text-xs font-semibold rounded-lg hover:bg-[#20ba5a] transition-colors"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                      Enquire on WhatsApp
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="sm:hidden space-y-3">
                          {college.courses.map((course) => (
                            <div key={course.id} className="bg-gray-50 rounded-xl p-4">
                              <div className="font-semibold text-gray-900 mb-1">{course.name}</div>
                              <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                                <Clock className="w-3.5 h-3.5" />
                                {course.duration}
                              </div>
                              {course.eligibility && (
                                <div className="text-xs text-gray-500 mb-3">Eligibility: {course.eligibility}</div>
                              )}
                              <button
                                onClick={() => openWA(college.name, course.name)}
                                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#25D366] text-white text-sm font-semibold rounded-lg hover:bg-[#20ba5a] transition-colors"
                              >
                                <MessageCircle className="w-4 h-4" />
                                Enquire on WhatsApp
                              </button>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-400 text-sm italic">No courses added yet for this college.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
