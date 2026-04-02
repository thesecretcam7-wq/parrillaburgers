"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Home, UtensilsCrossed, ShoppingCart, PackageSearch, User, Bell, Search } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { createClient } from "@/lib/supabase/client";
import { MenuItem, Category } from "@/lib/types";
import toast from "react-hot-toast";
import SearchModal from "../menu/SearchModal";

const TITLES: Record<string, string> = {
  "/carrito":     "Tu Carrito",
  "/pedido":      "Completa tu Pedido",
  "/seguimiento": "Seguimiento",
  "/mis-pedidos": "Mis Pedidos",
};

const BACK: Record<string, string> = {
  "/carrito":     "/menu",
  "/pedido":      "/carrito",
  "/seguimiento": "/mis-pedidos",
  "/mis-pedidos": "/",
};

const NAV_LINKS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/menu", label: "Menú", icon: UtensilsCrossed },
  { href: "/carrito", label: "Carrito", icon: ShoppingCart },
  { href: "/seguimiento", label: "Mi Pedido", icon: PackageSearch },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const itemCount = useCartStore((s) => s.itemCount());
  const [showSearch, setShowSearch] = useState(false);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Load menu items and categories for search
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        const supabase = createClient();
        const [itemsRes, catsRes] = await Promise.all([
          supabase.from("menu_items").select("*"),
          supabase.from("categories").select("*"),
        ]);

        if (itemsRes.data) setItems(itemsRes.data as MenuItem[]);
        if (catsRes.data) setCategories(catsRes.data as Category[]);
      } catch (error) {
        console.error("Error loading menu data:", error);
      }
    };

    loadMenuData();
  }, []);

  if (pathname.startsWith("/admin")) return null;

  const title = TITLES[pathname];
  const backHref = BACK[pathname];

  const handleNotifications = () => {
    toast.error("Sin notificaciones nuevas", { duration: 2000 });
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-[#1A1B21]/85 backdrop-blur-md border-b border-[#2E3038]/60 h-14"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex items-center justify-between h-full px-4 max-w-[430px] mx-auto gap-3 relative">
        {/* Left section: Back button or Logo */}
        <div className="flex items-center gap-3 min-w-0">
          {backHref && title ? (
            <Link href={backHref} className="w-9 h-9 flex items-center justify-center rounded-full bg-[#22242C] shrink-0 hover:bg-[#2E3038] transition-colors">
              <ArrowLeft size={18} className="text-white" />
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image
                src="/logo-real.png"
                alt="ParillaBurgers"
                width={44}
                height={38}
                priority
                className="brightness-0 invert"
              />
              <div className="flex flex-col leading-none">
                <span className="font-black text-white text-sm leading-tight">
                  Parrilla<span className="text-[#D4A017]">Burgers</span>
                </span>
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

        {/* Right section: Icons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search Icon */}
          <button
            onClick={() => setShowSearch(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#22242C] hover:bg-[#2E3038] transition-colors"
            aria-label="Buscar"
          >
            <Search size={18} className="text-white" />
          </button>

          {/* Notifications Icon */}
          <button
            onClick={handleNotifications}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#22242C] hover:bg-[#2E3038] transition-colors"
            aria-label="Notificaciones"
          >
            <Bell size={18} className="text-white" />
          </button>

          {/* Profile Icon */}
          <Link
            href="/perfil"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#22242C] hover:bg-[#2E3038] transition-colors"
            aria-label="Perfil"
          >
            <User size={18} className="text-white" />
          </Link>
        </div>
      </div>

      {/* Search Modal */}
      {showSearch && (
        <SearchModal
          items={items}
          categories={categories}
          onClose={() => setShowSearch(false)}
        />
      )}
    </header>
  );
}
