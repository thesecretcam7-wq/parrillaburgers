"use client";

import Link from "next/link";
import NextImage from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, Users, Image, Menu, X, ArrowLeft, Tag, Settings } from "lucide-react";

const navLinks = [
  { href: "/admin",                label: "Dashboard",      icon: LayoutDashboard },
  { href: "/admin/pedidos",        label: "Pedidos",        icon: ShoppingBag },
  { href: "/admin/menu",           label: "Menú",           icon: UtensilsCrossed },
  { href: "/admin/categorias",     label: "Categorías",     icon: Tag },
  { href: "/admin/clientes",       label: "Clientes",       icon: Users },
  { href: "/admin/banners",        label: "Banners",        icon: Image },
  { href: "/admin/configuracion",  label: "Configuración",  icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const NavItems = ({ onClose }: { onClose?: () => void }) => (
    <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
      {navLinks.map(({ href, label, icon: Icon }) => {
        const isActive = href === "/admin"
          ? pathname === "/admin"
          : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
              isActive
                ? "bg-[#D4A017]/15 text-[#D4A017] font-semibold"
                : "text-[#CCCCCC] hover:text-[#D4A017] hover:bg-[#D4A017]/10"
            }`}
          >
            <Icon size={18} className={isActive ? "text-[#D4A017]" : "text-[#888899]"} />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#111217] flex">

      {/* ── DESKTOP sidebar — sticky, in-flow (no fixed) ── */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-[#1A1B21] border-r border-[#2E3038] sticky top-0 h-screen self-start">
        {/* Logo */}
        <div className="p-5 border-b border-[#2E3038]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center shrink-0">
              <NextImage src="/logo-real.png" alt="ParillaBurgers" width={44} height={34} className="brightness-0 invert" />
            </div>
            <div>
              <p className="text-[#F5F0E8] font-bold text-sm">ParillaBurgers</p>
              <p className="text-[#888899] text-xs">Panel Admin</p>
            </div>
          </div>
        </div>
        <NavItems />
        <div className="p-4 border-t border-[#2E3038]">
          <Link href="/" className="flex items-center gap-2 text-[#888899] hover:text-[#CCCCCC] text-xs transition-colors">
            <ArrowLeft size={14} /> Ver sitio
          </Link>
        </div>
      </aside>

      {/* ── MOBILE overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── MOBILE drawer ── */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#1A1B21] border-r border-[#2E3038] flex flex-col z-50 transition-transform duration-300 lg:hidden ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="p-5 border-b border-[#2E3038] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center shrink-0">
              <NextImage src="/logo-real.png" alt="ParillaBurgers" width={44} height={34} className="brightness-0 invert" />
            </div>
            <div>
              <p className="text-[#F5F0E8] font-bold text-sm">ParillaBurgers</p>
              <p className="text-[#888899] text-xs">Panel Admin</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-[#888899] hover:text-[#F5F0E8] p-1">
            <X size={20} />
          </button>
        </div>
        <NavItems onClose={() => setSidebarOpen(false)} />
        <div className="p-4 border-t border-[#2E3038]">
          <Link href="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 text-[#888899] hover:text-[#CCCCCC] text-xs transition-colors">
            <ArrowLeft size={14} /> Ver sitio
          </Link>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 h-14 bg-[#1A1B21] border-b border-[#2E3038] sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-[#CCCCCC] hover:text-[#D4A017] hover:bg-[#D4A017]/10 transition-colors"
          >
            <Menu size={20} />
          </button>
          <p className="text-[#F5F0E8] font-bold text-sm">
            {navLinks.find(l => l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href))?.label ?? "Admin"}
          </p>
        </div>

        <div className="p-4 lg:p-8 overflow-x-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
