"use client";

import Image from "next/image";
import { Plus, Minus } from "lucide-react";
import { MenuItem } from "@/lib/types";
import { useCartStore } from "@/lib/store/cart";

export default function MenuItemCard({ item }: { item: MenuItem }) {
  const { items, addItem, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.item.id === item.id);
  const qty = cartItem?.quantity ?? 0;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#F0F0F0] flex flex-col">
      {/* Image */}
      <div className="relative h-36 bg-[#F8F8F8]">
        {item.image_url ? (
          <Image src={item.image_url} alt={item.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">🍔</span>
          </div>
        )}
        {!item.available && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="text-[#9CA3AF] text-xs font-semibold bg-white px-3 py-1 rounded-full border border-[#E4E4E7]">
              No disponible
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-[#111217] font-bold text-sm leading-tight">{item.name}</h3>
        {item.description && (
          <p className="text-[#9CA3AF] text-[11px] mt-0.5 line-clamp-2 flex-1">{item.description}</p>
        )}

        <div className="flex items-center justify-between mt-2.5">
          <span className="text-[#D4A017] font-black text-base">
            ${Number(item.price).toLocaleString("es-CO")}
          </span>

          {item.available && (
            <>
              {qty === 0 ? (
                <button
                  onClick={() => addItem(item)}
                  className="w-7 h-7 bg-[#D4A017] rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-sm"
                >
                  <Plus size={16} className="text-white" strokeWidth={2.5} />
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQuantity(item.id, qty - 1)}
                    className="w-6 h-6 rounded-full border-2 border-[#D4A017] flex items-center justify-center"
                  >
                    <Minus size={11} className="text-[#D4A017]" strokeWidth={2.5} />
                  </button>
                  <span className="text-[#111217] font-bold text-sm w-4 text-center">{qty}</span>
                  <button
                    onClick={() => addItem(item)}
                    className="w-6 h-6 rounded-full bg-[#D4A017] flex items-center justify-center"
                  >
                    <Plus size={11} className="text-white" strokeWidth={2.5} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
