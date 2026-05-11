"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowLeft, Bell, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/lib/store/cart";
import { createClient } from "@/lib/supabase/client";
import { MenuItem, Category } from "@/lib/types";
import toast from "react-hot-toast";
import SearchModal from "../menu/SearchModal";

const TITLES: Record<string, string> = {
  "/carrito": "Tu Carrito",
  "/pedido": "Completa tu Pedido",
  "/seguimiento": "Seguimiento",
  "/mis-pedidos": "Mis Pedidos",
};

const BACK: Record<string, string> = {
  "/carrito": "/menu",
  "/pedido": "/carrito",
  "/seguimiento": "/mis-pedidos",
  "/mis-pedidos": "/",
};

const links = [
  { href: "/", label: "Inicio" },
  { href: "/menu", label: "Menu" },
  { href: "/mis-pedidos", label: "Pedidos" },
  { href: "/perfil", label: "Perfil" },
];

export default function Navbar() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.itemCount());
  const [showSearch, setShowSearch] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-white/10 bg-[#0B0B0B]/78 shadow-[0_18px_60px_rgba(0,0,0,0.42)] backdrop-blur-2xl"
            : "bg-gradient-to-b from-black/78 to-transparent"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {backHref && title ? (
              <Link
                href={backHref}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:border-[#F5B041]/50 hover:bg-[#F5B041]/10"
                aria-label="Volver"
              >
                <ArrowLeft size={18} />
              </Link>
            ) : null}

            <Link href="/" className="group flex items-center gap-3">
              <span className="relative grid h-11 w-11 place-items-center rounded-full border border-[#F5B041]/25 bg-black/40 shadow-[0_0_34px_rgba(245,176,65,0.18)]">
                <Image src="/logo-real.png" alt="ParrillaBurgers" width={44} height={44} priority className="h-9 w-9 object-contain brightness-110" />
                <span className="absolute inset-0 rounded-full bg-[#F5B041]/12 opacity-0 blur-md transition group-hover:opacity-100" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-[var(--font-premium)] text-[0.72rem] font-black uppercase tracking-[0.28em] text-white/58">Premium Grill</span>
                <span className="font-[var(--font-premium)] text-sm font-black uppercase tracking-[0.08em] text-white sm:text-base">
                  Parrilla<span className="text-[#F5B041]">Burgers</span>
                </span>
              </span>
            </Link>

            {title ? (
              <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white/68 md:inline-flex">
                {title}
              </span>
            ) : null}
          </div>

          <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.035] p-1 backdrop-blur-xl md:flex">
            {links.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition ${
                    active ? "bg-[#F5B041] text-black" : "text-white/62 hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(true)}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:border-[#F5B041]/45 hover:bg-[#F5B041]/10"
              aria-label="Buscar"
            >
              <Search size={18} />
            </button>
            <button
              onClick={handleNotifications}
              className="relative hidden h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:border-[#F5B041]/45 hover:bg-[#F5B041]/10 sm:grid"
              aria-label="Notificaciones"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#FF5A1F] shadow-[0_0_14px_rgba(255,90,31,0.8)]" />
            </button>
            <Link
              href="/carrito"
              className="relative grid h-10 w-10 place-items-center rounded-full border border-[#F5B041]/25 bg-[#F5B041]/10 text-white transition hover:bg-[#F5B041] hover:text-black"
              aria-label="Carrito"
            >
              <ShoppingCart size={18} />
              {itemCount > 0 ? (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#FF3B1F] px-1 text-[10px] font-black text-white shadow-[0_0_14px_rgba(255,59,31,0.7)]">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              ) : null}
            </Link>
            <Link
              href="/perfil"
              className="hidden h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:border-[#F5B041]/45 hover:bg-[#F5B041]/10 sm:grid"
              aria-label="Perfil"
            >
              <User size={18} />
            </Link>
            <button
              onClick={() => setMenuOpen((value) => !value)}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white md:hidden"
              aria-label="Abrir menu"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-x-3 top-[calc(4.5rem+env(safe-area-inset-top))] z-40 overflow-hidden rounded-[28px] border border-white/10 bg-[#111]/92 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl md:hidden"
          >
            <div className="grid gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4 font-[var(--font-premium)] text-sm font-black uppercase tracking-[0.16em] text-white"
                >
                  {link.label}
                  <span className="h-2 w-2 rounded-full bg-[#F5B041]" />
                </Link>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {showSearch ? (
        <SearchModal
          items={items}
          categories={categories}
          onClose={() => setShowSearch(false)}
        />
      ) : null}
    </>
  );
}
