"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Building2, Image as ImageIcon, Phone } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/colleges", label: "Colleges", icon: Building2 },
  { href: "/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/contact", label: "Contact", icon: Phone },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex justify-around items-center h-16 px-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              isActive ? "text-blue-900" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <div className={`p-1 rounded-full ${isActive ? "bg-blue-50" : ""}`}>
              <Icon className={`w-5 h-5 ${isActive ? "fill-blue-100" : ""}`} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-medium ${isActive ? "font-bold" : ""}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
