"use client";

import { useCartStore } from "@/lib/store/cart";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, clearCart } = useCartStore();
  const subtotal = total();
  const delivery = 3000;
  const grandTotal = subtotal + delivery;

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#F4F4F5] flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 rounded-full bg-[#E4E4E7] flex items-center justify-center mb-4">
          <ShoppingBag className="text-[#9CA3AF]" size={40} />
        </div>
        <h2 className="text-xl font-bold text-[#111217] mb-2">Tu carrito está vacío</h2>
        <p className="text-[#9CA3AF] mb-8 text-sm">Agrega productos desde el menú</p>
        <Link
          href="/menu"
          className="bg-[#D4A017] text-white font-bold px-8 py-3 rounded-xl"
        >
          Ver Menú
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F4F5] px-4 py-4">
      <div className="max-w-lg mx-auto space-y-3">

        {/* Items */}
        <div className="space-y-2">
          {items.map(({ item, quantity }) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm"
            >
              <div className="w-14 h-14 rounded-xl bg-[#F4F4F5] flex items-center justify-center shrink-0 overflow-hidden">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.name} width={56} height={56} className="object-cover w-full h-full rounded-xl" />
                ) : (
                  <span className="text-2xl">🍔</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-[#111217] font-semibold text-sm truncate">{item.name}</h3>
                <p className="text-[#D4A017] font-bold text-sm">${item.price.toLocaleString("es-CO")}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, quantity - 1)}
                  className="w-7 h-7 rounded-full border border-[#E4E4E7] text-[#9CA3AF] flex items-center justify-center"
                >
                  <Minus size={13} />
                </button>
                <span className="text-[#111217] font-semibold w-5 text-center text-sm">{quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, quantity + 1)}
                  className="w-7 h-7 rounded-full bg-[#D4A017] text-white flex items-center justify-center"
                >
                  <Plus size={13} />
                </button>
              </div>

              <div className="text-right min-w-[70px]">
                <p className="text-[#111217] font-bold text-sm">
                  ${(item.price * quantity).toLocaleString("es-CO")}
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-[#9CA3AF] hover:text-red-400 transition-colors mt-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={clearCart}
          className="text-[#9CA3AF] hover:text-red-400 text-xs transition-colors flex items-center gap-1 px-1"
        >
          <Trash2 size={13} /> Vaciar carrito
        </button>

        {/* Summary card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-[#111217] font-bold mb-4">Resumen del pedido</h2>

          <div className="space-y-2.5 mb-5 text-sm">
            <div className="flex justify-between text-[#71717A]">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString("es-CO")}</span>
            </div>
            <div className="flex justify-between text-[#71717A]">
              <span>Domicilio</span>
              <span>${delivery.toLocaleString("es-CO")}</span>
            </div>
            <div className="border-t border-[#F4F4F5] pt-2.5 flex justify-between font-bold text-base">
              <span className="text-[#111217]">Total</span>
              <span className="text-[#D4A017]">${grandTotal.toLocaleString("es-CO")}</span>
            </div>
          </div>

          {/* Points strip */}
          <div className="bg-[#FDF3D7] rounded-xl px-4 py-2.5 flex items-center gap-2 mb-4">
            <span className="text-lg">🎯</span>
            <p className="text-[#B8860B] text-xs font-medium">
              Ganarás <strong>{Math.floor(grandTotal / 1000)} puntos</strong> con este pedido
            </p>
          </div>

          <Link
            href="/pedido"
            className="flex items-center justify-center gap-2 bg-[#D4A017] text-white font-bold py-3.5 rounded-xl w-full"
          >
            Continuar
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </main>
  );
}
