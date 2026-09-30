"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { GraduationCap, Menu, X, ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/colleges", label: "Colleges & Courses" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact Us" },
];

interface NavbarProps {
  logoUrl?: string | null;
}

export default function Navbar({ logoUrl }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-blue-950/95 backdrop-blur-md shadow-lg border-b border-white/10"
          : "bg-blue-950/80 backdrop-blur-sm border-b border-white/5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3.5 group">
            {logoUrl ? (
              <div className="w-11 h-11 relative rounded-lg overflow-hidden bg-white shadow-md group-hover:scale-105 transition-transform duration-300 flex items-center justify-center p-1">
                <Image
                  src={logoUrl}
                  alt="Prathvi Group of College Logo"
                  width={512}
                  height={512}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-yellow-400 flex items-center justify-center shadow-md shadow-yellow-400/20 group-hover:scale-105 transition-transform duration-300">
                <GraduationCap className="w-6 h-6 text-blue-950" />
              </div>
            )}
            <div className="flex flex-col w-max">
              <span className="text-white font-black tracking-[0.2em] text-2xl leading-none group-hover:text-yellow-400 transition-colors uppercase">
                PRATHVI
              </span>
              <span className="text-yellow-400 font-bold text-[10px] uppercase leading-none mt-1" style={{ textAlignLast: "justify" }}>
                Group of College
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-yellow-400 text-blue-950 shadow-sm"
                      : "text-blue-100 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/contact#enquire"
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-blue-950 font-bold text-sm shadow-md shadow-yellow-400/20 hover:shadow-yellow-400/30 transition-all duration-200 flex items-center gap-2 group"
            >
              <span>Enquire Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-xl text-blue-100 hover:text-white hover:bg-white/10 focus:outline-none transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-blue-950/98 border-b border-white/10 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 pt-3 pb-6 space-y-2">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                    isActive
                      ? "bg-yellow-400 text-blue-950 font-bold"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            <div className="pt-3">
              <Link
                href="/contact#enquire"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-blue-950 font-bold text-center shadow-lg"
              >
                <span>Enquire Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
