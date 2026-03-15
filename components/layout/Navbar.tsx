"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowLeft, Home, UtensilsCrossed, ShoppingCart, PackageSearch } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";

const TITLES: Record<string, string> = {
  "/carrito": "Tu Carrito",
  "/pedido": "Completa tu Pedido",
  "/seguimiento": "Seguimiento",
};

const BACK: Record<string, string> = {
  "/carrito": "/",
  "/pedido": "/carrito",
  "/seguimiento": "/",
};

const NAV_LINKS = [
  { href: "/", label: "Menú", icon: UtensilsCrossed },
  { href: "/carrito", label: "Carrito", icon: ShoppingCart },
  { href: "/seguimiento", label: "Mi Pedido", icon: PackageSearch },
];

export default function Navbar() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.itemCount());

  if (pathname.startsWith("/admin")) return null;

  const title = TITLES[pathname];
  const backHref = BACK[pathname];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-[#1A1B21] border-b border-[#2E3038] h-14"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex items-center h-full px-4 max-w-5xl mx-auto gap-3 relative">
        {/* Back button o Logo */}
        {backHref && title ? (
          <Link href={backHref} className="w-9 h-9 flex items-center justify-center rounded-full bg-[#22242C] shrink-0">
            <ArrowLeft size={18} className="text-white" />
          </Link>
        ) : (
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#D4A017] flex items-center justify-center">
              <Image src="/logo.svg" alt="ParillaBurgers" width={26} height={26} priority />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-white text-sm leading-tight">
                Parrilla<span className="text-[#D4A017]">Burgers</span>
              </span>
              <span className="text-[9px] text-[#6B7280] font-medium">El mejor sabor a la parrilla</span>
            </div>
          </Link>
        )}

        {/* Título centrado — móvil en páginas internas */}
        {title && (
          <span className="lg:hidden absolute left-1/2 -translate-x-1/2 font-bold text-white text-sm whitespace-nowrap">
            {title}
          </span>
        )}

        {/* Título inline — desktop páginas internas */}
        {title && (
          <span className="hidden lg:block font-bold text-white text-sm ml-2">
            {title}
          </span>
        )}

        {/* Nav links desktop */}
        <nav className="hidden lg:flex items-center gap-1 ml-auto">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = href === "/" ? (pathname === "/" || pathname === "/menu") : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? "text-[#D4A017] bg-[#2A2414]"
                    : "text-[#9CA3AF] hover:text-white hover:bg-[#22242C]"
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
                {label}
                {href === "/carrito" && itemCount > 0 && (
                  <span className="bg-[#D4A017] text-[#0F1117] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
