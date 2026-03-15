"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  "/": "",
  "/menu": "Nuestro Menú",
  "/carrito": "Tu Carrito",
  "/pedido": "Completa tu Pedido",
  "/seguimiento": "Seguimiento",
};

export default function Navbar() {
  const pathname = usePathname();

  // No mostrar en admin
  if (pathname.startsWith("/admin")) return null;

  const title = TITLES[pathname] ?? "";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#F0F0F0] h-14"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex items-center justify-between h-full px-4 max-w-lg mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/logo.svg" alt="ParillaBurgers" width={36} height={36} priority
            className="drop-shadow-sm"
            style={{ filter: "invert(0) sepia(1) saturate(2) hue-rotate(10deg)" }}
          />
          {!title && (
            <span className="font-black text-[#111217] text-base hidden xs:block">
              Parrilla<span className="text-[#D4A017]">Burgers</span>
            </span>
          )}
        </Link>

        {/* Page title centered */}
        {title && (
          <span className="absolute left-1/2 -translate-x-1/2 font-bold text-[#111217] text-base">
            {title}
          </span>
        )}

        {/* Right: empty spacer for balance */}
        <div className="w-9" />
      </div>
    </header>
  );
}
