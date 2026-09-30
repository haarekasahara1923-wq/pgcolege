"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Image as ImageIcon, Video, LayoutGrid } from "lucide-react";

interface GalleryItem {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  publicId?: string | null;
  youtubeUrl?: string | null;
  title?: string | null;
  category?: string | null;
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"ALL" | "IMAGE" | "VIDEO">("ALL");
  const [category, setCategory] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((data) => setItems(data.items || []))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["all", ...Array.from(new Set(items.map((i) => i.category).filter(Boolean) as string[]))];

  const filtered = items.filter((item) => {
    const matchTab = tab === "ALL" || item.type === tab;
    const matchCat = category === "all" || item.category === category;
    return matchTab && matchCat;
  });

  const closeLightbox = () => setLightboxIndex(null);

  const navigate = useCallback((dir: 1 | -1) => {
    if (lightboxIndex === null) return;
    const next = (lightboxIndex + dir + filtered.length) % filtered.length;
    setLightboxIndex(next);
  }, [lightboxIndex, filtered.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, navigate]);

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative py-16 px-4 text-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/gallery-hero.jpg" alt="Gallery Prathvi Group" fill className="object-cover object-center" priority />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 to-blue-800/80" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Gallery</h1>
          <p className="text-blue-200 text-lg">Memories and moments from our campus</p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 lg:top-20 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Tab filter */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              {[
                { key: "ALL", label: "All", icon: LayoutGrid },
                { key: "IMAGE", label: "Images", icon: ImageIcon },
                { key: "VIDEO", label: "Videos", icon: Video },
              ].map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setTab(key as "ALL" | "IMAGE" | "VIDEO")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === key ? "bg-white shadow text-blue-900" : "text-gray-500 hover:text-gray-700"}`}>
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
            {/* Category filter */}
            {categories.length > 1 && categories.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${category === cat ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-10 px-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="break-inside-avoid bg-gray-200 rounded-xl animate-pulse" style={{ height: `${Math.random() * 100 + 150}px` }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-500">No items found</h2>
              <p className="text-gray-400 mt-2">Try a different filter or check back later.</p>
            </div>
          ) : (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
              {filtered.map((item, idx) => (
                <div key={item.id} onClick={() => setLightboxIndex(idx)}
                  className="break-inside-avoid mb-3 group cursor-pointer rounded-xl overflow-hidden relative bg-gray-200">
                  {item.type === "IMAGE" ? (
                    <Image
                      src={item.url}
                      alt={item.title ?? "Gallery image"}
                      width={400}
                      height={300}
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUE/8QAGhABAQADAQAAAAAAAAAAAAAAAQIDBAURM//EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFREBAQAAAAAAAAAAAAAAAAAAAAH/2gAMAwEAAhEDEQA/AMdQa//Z"
                    />
                  ) : (
                    <div className="aspect-video bg-gray-800 flex items-center justify-center relative">
                      {item.youtubeUrl ? (
                        <Image
                          src={`https://img.youtube.com/vi/${getYouTubeId(item.youtubeUrl) ?? ""}/mqdefault.jpg`}
                          alt={item.title ?? "Video thumbnail"}
                          fill
                          className="object-cover opacity-70"
                        />
                      ) : null}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/50 transition-colors">
                          <span className="text-white text-xl ml-1">â–¶</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {item.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs font-medium">{item.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && filtered[lightboxIndex] && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}>
          <button onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10">
            <X className="w-6 h-6" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); navigate(-1); }}
            className="absolute left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); navigate(1); }}
            className="absolute right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10">
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="max-w-5xl max-h-[90vh] w-full mx-4" onClick={(e) => e.stopPropagation()}>
            {filtered[lightboxIndex].type === "IMAGE" ? (
              <Image
                src={filtered[lightboxIndex].url}
                alt={filtered[lightboxIndex].title ?? "Gallery"}
                width={1200}
                height={800}
                className="max-h-[90vh] w-full object-contain rounded-xl"
              />
            ) : filtered[lightboxIndex].youtubeUrl ? (
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(filtered[lightboxIndex].youtubeUrl!)}`}
                  className="w-full h-full rounded-xl"
                  allowFullScreen
                />
              </div>
            ) : (
              <video src={filtered[lightboxIndex].url} controls autoPlay className="max-h-[90vh] w-full rounded-xl" />
            )}
            {filtered[lightboxIndex].title && (
              <p className="text-white text-center mt-3 text-sm">{filtered[lightboxIndex].title}</p>
            )}
            <p className="text-gray-400 text-center text-xs mt-1">{lightboxIndex + 1} / {filtered.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}
