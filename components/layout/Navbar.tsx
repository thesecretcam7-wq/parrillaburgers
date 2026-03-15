"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const TITLES: Record<string, string> = {
  "/menu": "Nuestro Menú",
  "/carrito": "Tu Carrito",
  "/pedido": "Completa tu Pedido",
  "/seguimiento": "Seguimiento",
};

const BACK: Record<string, string> = {
  "/carrito": "/menu",
  "/pedido": "/carrito",
  "/seguimiento": "/",
};

export default function Navbar() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  const title = TITLES[pathname];
  const backHref = BACK[pathname];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white h-14 shadow-sm"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex items-center h-full px-4 max-w-lg mx-auto gap-3 relative">
        {/* Back button o Logo */}
        {backHref ? (
          <Link href={backHref} className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F4F4F5] shrink-0">
            <ArrowLeft size={18} className="text-[#111217]" />
          </Link>
        ) : (
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            {/* Logo sobre fondo oscuro */}
            <div className="w-9 h-9 rounded-full bg-[#111217] flex items-center justify-center">
              <Image src="/logo.svg" alt="ParillaBurgers" width={26} height={26} priority />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-[#111217] text-sm leading-tight">
                Parrilla<span className="text-[#D4A017]">Burgers</span>
              </span>
              <span className="text-[9px] text-[#9CA3AF] font-medium">El mejor sabor a la parrilla</span>
            </div>
          </Link>
        )}

        {/* Título centrado para páginas internas */}
        {title && (
          <span className="absolute left-1/2 -translate-x-1/2 font-bold text-[#111217] text-sm whitespace-nowrap">
            {title}
          </span>
        )}
      </div>
    </header>
  );
}
