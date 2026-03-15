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
      <main className="min-h-screen bg-[#111217] flex flex-col items-center justify-center px-4">
        <ShoppingBag className="text-[#2E3038] mb-4" size={80} />
        <h2 className="text-2xl font-bold text-[#F5F0E8] mb-2">Tu carrito está vacío</h2>
        <p className="text-[#888899] mb-8">Agrega productos desde el menú</p>
        <Link
          href="/menu"
          className="bg-[#D4A017] hover:bg-[#E8B830] text-[#111217] font-bold px-8 py-3 rounded-xl transition-colors"
        >
          Ver Menú
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#111217] px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-[#F5F0E8] mb-8">Tu Pedido</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(({ item, quantity }) => (
              <div
                key={item.id}
                className="bg-[#22232B] border border-[#2E3038] rounded-xl p-4 flex items-center gap-4"
              >
                <div className="w-16 h-16 rounded-lg bg-[#1A1B21] flex items-center justify-center shrink-0 overflow-hidden">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} width={64} height={64} className="object-cover" />
                  ) : (
                    <span className="text-2xl">🍔</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-[#F5F0E8] font-semibold truncate">{item.name}</h3>
                  <p className="text-[#D4A017] font-bold">${item.price.toLocaleString("es-CO")}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, quantity - 1)}
                    className="w-7 h-7 rounded-full border border-[#2E3038] text-[#CCCCCC] hover:border-[#D4A017] hover:text-[#D4A017] flex items-center justify-center transition-colors"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="text-[#F5F0E8] font-semibold w-5 text-center">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, quantity + 1)}
                    className="w-7 h-7 rounded-full bg-[#D4A017] text-[#111217] flex items-center justify-center hover:bg-[#E8B830] transition-colors"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                <div className="text-right min-w-[80px]">
                  <p className="text-[#F5F0E8] font-bold">
                    ${(item.price * quantity).toLocaleString("es-CO")}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-[#888899] hover:text-red-400 transition-colors mt-1"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="text-[#888899] hover:text-red-400 text-sm transition-colors flex items-center gap-1 mt-2"
            >
              <Trash2 size={14} /> Vaciar carrito
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#22232B] border border-[#2E3038] rounded-xl p-6 sticky top-24">
              <h2 className="text-[#F5F0E8] font-bold text-lg mb-6">Resumen</h2>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between text-[#CCCCCC]">
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString("es-CO")}</span>
                </div>
                <div className="flex justify-between text-[#CCCCCC]">
                  <span>Domicilio</span>
                  <span>${delivery.toLocaleString("es-CO")}</span>
                </div>
                <div className="border-t border-[#2E3038] pt-3 flex justify-between font-bold text-base">
                  <span className="text-[#F5F0E8]">Total</span>
                  <span className="text-[#D4A017]">${grandTotal.toLocaleString("es-CO")}</span>
                </div>
              </div>

              <Link
                href="/pedido"
                className="flex items-center justify-center gap-2 bg-[#D4A017] hover:bg-[#E8B830] text-[#111217] font-bold py-3 rounded-xl transition-colors w-full"
              >
                Hacer Pedido
                <ArrowRight size={16} />
              </Link>

              <p className="text-[#888899] text-xs text-center mt-3">
                🎯 Ganas puntos con este pedido
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
