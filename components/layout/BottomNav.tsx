"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, ShoppingCart, PackageSearch } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";

const tabs = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/menu", label: "Menú", icon: UtensilsCrossed },
  { href: "/carrito", label: "Carrito", icon: ShoppingCart },
  { href: "/seguimiento", label: "Mi Pedido", icon: PackageSearch },
];

export default function BottomNav() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.itemCount());

  // No mostrar en admin
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E4E4E7] safe-area-bottom lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 relative transition-all ${
                isActive ? "text-[#D4A017]" : "text-[#9CA3AF]"
              }`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                {href === "/carrito" && itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#D4A017] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium leading-tight ${isActive ? "text-[#D4A017]" : "text-[#9CA3AF]"}`}>
                {label}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#D4A017] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
