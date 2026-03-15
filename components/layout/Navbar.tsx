"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/lib/store/cart";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount());

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#111217]/95 backdrop-blur border-b border-[#2E3038]">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full border-2 border-[#D4A017] flex items-center justify-center bg-[#1A1B21]">
            <span className="text-[#D4A017] font-bold text-xs leading-tight text-center">
              PB
            </span>
          </div>
          <span className="text-[#F5F0E8] font-bold text-lg hidden sm:block">
            Parrilla<span className="text-[#D4A017]">Burgers</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-[#CCCCCC] hover:text-[#D4A017] transition-colors text-sm">
            Inicio
          </Link>
          <Link href="/menu" className="text-[#CCCCCC] hover:text-[#D4A017] transition-colors text-sm">
            Menú
          </Link>
          <Link href="/seguimiento" className="text-[#CCCCCC] hover:text-[#D4A017] transition-colors text-sm">
            Mi Pedido
          </Link>
        </div>

        {/* Cart + mobile toggle */}
        <div className="flex items-center gap-3">
          <Link href="/carrito" className="relative p-2 text-[#CCCCCC] hover:text-[#D4A017] transition-colors">
            <ShoppingCart size={22} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D4A017] text-[#111217] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
          <button
            className="md:hidden p-2 text-[#CCCCCC]"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#1A1B21] border-t border-[#2E3038] px-4 py-4 flex flex-col gap-4">
          <Link href="/" className="text-[#CCCCCC] hover:text-[#D4A017]" onClick={() => setOpen(false)}>
            Inicio
          </Link>
          <Link href="/menu" className="text-[#CCCCCC] hover:text-[#D4A017]" onClick={() => setOpen(false)}>
            Menú
          </Link>
          <Link href="/seguimiento" className="text-[#CCCCCC] hover:text-[#D4A017]" onClick={() => setOpen(false)}>
            Mi Pedido
          </Link>
        </div>
      )}
    </nav>
  );
}
