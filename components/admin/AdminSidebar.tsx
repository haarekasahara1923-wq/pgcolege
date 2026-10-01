"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  Building2,
  BookOpen,
  Info,
  Phone,
  Image as ImageIcon,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
  Users,
} from "lucide-react";
import { logoutAction } from "@/actions/auth-actions";
import { toast } from "sonner";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/colleges", label: "Colleges", icon: Building2 },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/about", label: "About Us", icon: Info },
  { href: "/admin/contact", label: "Contact Details", icon: Phone },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/enquiries", label: "Enquiries", icon: MessageSquare },
  { href: "/admin/affiliates", label: "Affiliate Partners", icon: Users },
];

interface AdminSidebarProps {
  email: string;
  logoUrl?: string | null;
}

export default function AdminSidebar({ email, logoUrl }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logoutAction();
    } catch {
      toast.error("Logout failed");
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-blue-950 text-white">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <div className="w-12 h-12 relative rounded-lg bg-white overflow-hidden shadow-md shrink-0 flex items-center justify-center p-1">
              <Image
                src={logoUrl}
                alt="Admin Logo"
                width={512}
                height={512}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-md shadow-yellow-400/20 shrink-0">
              <GraduationCap className="w-6 h-6 text-blue-950" />
            </div>
          )}
          <div className="overflow-hidden">
            <div className="text-white font-bold text-sm leading-tight truncate">
              Prathvi Group
            </div>
            <div className="text-yellow-400 font-semibold text-xs tracking-wider uppercase">
              Admin Portal
            </div>
            <div className="text-blue-300/80 text-[11px] truncate mt-0.5" title={email}>
              {email}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                isActive
                  ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-blue-950 shadow-md font-bold"
                  : "text-blue-100 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  isActive ? "text-blue-950" : "text-blue-300 group-hover:text-yellow-400"
                }`}
              />
              <span className="truncate">{label}</span>
              {isActive && <ChevronRight className="w-4 h-4 ml-auto text-blue-950 shrink-0" />}
            </Link>
          );
        })}

        {/* View Public Site Link */}
        <div className="pt-4 mt-4 border-t border-white/10">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-blue-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            <span>View Public Website</span>
          </Link>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-300 hover:text-white hover:bg-red-500/20 transition-all duration-200"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-blue-950 border-b border-white/10 z-30 px-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <div className="w-9 h-9 relative bg-white rounded-lg flex items-center justify-center p-1">
              <Image src={logoUrl} alt="Logo" width={512} height={512} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-blue-950" />
            </div>
          )}
          <span className="text-white font-bold text-sm">Prathvi Admin</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-white hover:bg-white/10 rounded-xl"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer / Fixed Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 z-40 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
