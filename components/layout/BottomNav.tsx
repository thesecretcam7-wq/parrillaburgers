"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, ShoppingCart, ClipboardList } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";

const tabs = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/carrito", label: "Carrito", icon: ShoppingCart },
  { href: "/mis-pedidos", label: "Mis Pedidos", icon: ClipboardList },
];

export default function BottomNav() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.itemCount());

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0B0B0B]/82 shadow-[0_-18px_60px_rgba(0,0,0,0.48)] backdrop-blur-2xl safe-area-bottom md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex h-[68px] max-w-[430px] items-center justify-around px-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 transition-all duration-300 active:scale-95 ${
                isActive ? "text-[#F5B041]" : "text-white/46"
              }`}
            >
              <div className={`relative grid h-9 w-11 place-items-center rounded-2xl transition ${isActive ? "bg-[#F5B041]/12 shadow-[0_0_22px_rgba(245,176,65,0.16)]" : ""}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                {href === "/carrito" && itemCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF3B1F] text-[9px] font-black leading-none text-white">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] font-bold leading-tight ${isActive ? "text-[#F5B041]" : "text-white/46"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
