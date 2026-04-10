"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store/cart";
import { Minus, Plus, Trash2, ArrowRight, Clock } from "lucide-react";
import { BrandEmoji } from "@/components/ui/BrandEmoji";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useStoreStatus } from "@/lib/hooks/useStoreStatus";

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, clearCart } = useCartStore();
  const [delivery, setDelivery] = useState(3000);
  const [mesaNum, setMesaNum] = useState<string | null>(null);
  const { isOpen, mensajeCerrado } = useStoreStatus();
  const subtotal = total();
  const grandTotal = mesaNum ? subtotal : subtotal + delivery;

  useEffect(() => {
    createClient()
      .from("settings").select("value").eq("key", "delivery_fee").single()
      .then(({ data }) => { if (data) setDelivery(Number(data.value)); });
    try {
      const mesa = localStorage.getItem("pb-mesa");
      if (mesa) setMesaNum(mesa);
    } catch { /* ignore */ }
  }, []);

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#0F1117] flex flex-col items-center justify-center px-4">
        <BrandEmoji name="face" size={80} className="mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Tu carrito está vacío</h2>
        <p className="text-[#6B7280] mb-8 text-sm">Agrega productos desde el menú</p>
        <Link
          href="/menu"
          className="bg-[#D4A017] text-[#0F1117] font-bold px-8 py-3 rounded-xl"
        >
          Ver Menú
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F1117] px-4 py-4">
      <div className="max-w-lg mx-auto space-y-3">

        {/* Mesa badge */}
        {mesaNum && (
          <div className="bg-[#2A1E00] border border-[#D4A017]/40 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <span className="text-lg">🪑</span>
            <p className="text-[#D4A017] font-bold text-sm">Mesa {mesaNum}</p>
          </div>
        )}

        {/* Items */}
        <div className="space-y-2">
          {items.map(({ item, quantity, barra_libre_selected }) => (
            <div
              key={item.id}
              className="bg-[#16130A] rounded-2xl p-4 flex items-center gap-3 border border-[#2A2210]"
            >
              <div className="w-14 h-14 rounded-xl bg-[#1C1800] flex items-center justify-center shrink-0 overflow-hidden">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.name} width={56} height={56} className="object-cover w-full h-full rounded-xl" />
                ) : (
                  <span className="text-2xl">🍔</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm truncate">{item.name}</h3>
                <p className="text-[#D4A017] font-bold text-sm">${item.price.toLocaleString("es-CO")}</p>
                {barra_libre_selected && barra_libre_selected.length > 0 && (
                  <p className="text-[#6B7280] text-[10px] mt-0.5 truncate">
                    🥗 {barra_libre_selected.join(" · ")}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, quantity - 1)}
                  className="w-7 h-7 rounded-full border border-[#2A2210] text-[#9CA3AF] flex items-center justify-center"
                >
                  <Minus size={13} />
                </button>
                <span className="text-white font-semibold w-5 text-center text-sm">{quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, quantity + 1)}
                  className="w-7 h-7 rounded-full bg-[#D4A017] text-[#0F1117] flex items-center justify-center"
                >
                  <Plus size={13} />
                </button>
              </div>

              <div className="text-right min-w-[70px]">
                <p className="text-white font-bold text-sm">
                  ${(item.price * quantity).toLocaleString("es-CO")}
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-[#6B7280] hover:text-red-400 transition-colors mt-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={clearCart}
          className="text-[#6B7280] hover:text-red-400 text-xs transition-colors flex items-center gap-1 px-1"
        >
          <Trash2 size={13} /> Vaciar carrito
        </button>

        {/* Summary card */}
        <div className="bg-[#16130A] rounded-2xl p-5 border border-[#2A2210]">
          <h2 className="text-white font-bold mb-4">Resumen del pedido</h2>

          <div className="space-y-2.5 mb-5 text-sm">
            <div className="flex justify-between text-[#9CA3AF]">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString("es-CO")}</span>
            </div>
            {mesaNum ? (
              <div className="flex justify-between text-[#9CA3AF]">
                <span>En mesa</span>
                <span className="text-green-400">gratis</span>
              </div>
            ) : (
              <div className="flex justify-between text-[#9CA3AF]">
                <span>Domicilio</span>
                <span>${delivery.toLocaleString("es-CO")}</span>
              </div>
            )}
            <div className="border-t border-[#2A2210] pt-2.5 flex justify-between font-bold text-base">
              <span className="text-white">Total</span>
              <span className="text-[#D4A017]">${grandTotal.toLocaleString("es-CO")}</span>
            </div>
          </div>

          {/* Points strip */}
          <div className="bg-[#2A1E00] rounded-xl px-4 py-2.5 flex items-center gap-2 mb-4">
            <BrandEmoji name="burger" size={28} />
            <p className="text-[#E8B830] text-xs font-medium">
              Ganarás <strong>{Math.floor((mesaNum ? subtotal : grandTotal) / 1000)} puntos</strong> con este pedido
            </p>
          </div>

          {isOpen === false ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-4 flex items-start gap-3">
              <Clock size={18} className="text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-red-400 font-bold text-sm">Local cerrado</p>
                <p className="text-red-300/70 text-xs mt-0.5">{mensajeCerrado}</p>
              </div>
            </div>
          ) : (
            <Link
              href="/pedido"
              className={`flex items-center justify-center gap-2 bg-[#D4A017] text-[#0F1117] font-bold py-3.5 rounded-xl w-full transition-opacity ${isOpen === null ? "opacity-50 pointer-events-none" : ""}`}
            >
              Continuar
              <ArrowRight size={16} />
            </Link>
          )}
        </div>

      </div>
    </main>
  );
}
