"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, ShoppingCart, ClipboardList } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";

const tabs = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/menu", label: "Menú", icon: UtensilsCrossed },
  { href: "/carrito", label: "Carrito", icon: ShoppingCart },
  { href: "/mis-pedidos",  label: "Mis Pedidos", icon: ClipboardList },
];

export default function BottomNav() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.itemCount());

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-16 max-w-[430px] mx-auto px-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 relative transition-all ${
                isActive ? "text-[#D4A017]" : "text-gray-400"
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
              <span className={`text-[10px] font-semibold leading-tight ${isActive ? "text-[#D4A017]" : "text-gray-400"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
