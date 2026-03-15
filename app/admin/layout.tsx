import Link from "next/link";
import NextImage from "next/image";
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, Users, Image } from "lucide-react";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/admin/pedidos", label: "Pedidos", icon: <ShoppingBag size={18} /> },
  { href: "/admin/menu", label: "Menú", icon: <UtensilsCrossed size={18} /> },
  { href: "/admin/clientes", label: "Clientes", icon: <Users size={18} /> },
  { href: "/admin/banners", label: "Banners", icon: <Image size={18} /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#111217] flex">
      {/* Sidebar */}
      <aside className="w-60 bg-[#1A1B21] border-r border-[#2E3038] flex flex-col fixed h-full top-0 left-0 z-40">
        <div className="p-6 border-b border-[#2E3038]">
          <div className="flex items-center gap-3">
            <NextImage src="/logo.svg" alt="ParillaBurgers" width={36} height={36} />
            <div>
              <p className="text-[#F5F0E8] font-bold text-sm">ParillaBurgers</p>
              <p className="text-[#888899] text-xs">Panel Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#CCCCCC] hover:text-[#D4A017] hover:bg-[#D4A017]/10 transition-all text-sm"
            >
              <span className="text-[#D4A017]">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#2E3038]">
          <Link
            href="/"
            className="flex items-center gap-2 text-[#888899] hover:text-[#CCCCCC] text-xs transition-colors"
          >
            ← Ver sitio
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 ml-60">
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}
