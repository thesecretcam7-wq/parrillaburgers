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
  "/carrito": "/menu",
  "/pedido": "/carrito",
  "/seguimiento": "/",
};

const NAV_LINKS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/menu", label: "Menú", icon: UtensilsCrossed },
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
      <div className="flex items-center h-full px-4 max-w-[430px] mx-auto gap-3 relative">
        {/* Back button o Logo */}
        {backHref && title ? (
          <Link href={backHref} className="w-9 h-9 flex items-center justify-center rounded-full bg-[#22242C] shrink-0">
            <ArrowLeft size={18} className="text-white" />
          </Link>
        ) : (
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-full bg-black border border-white/20 flex items-center justify-center overflow-hidden">
              <Image src="/logo.svg" alt="ParillaBurgers" width={36} height={36} priority />
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

      </div>
    </header>
  );
}
