"use client";

import Image from "next/image";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { MenuItem } from "@/lib/types";
import { useCartStore } from "@/lib/store/cart";

export default function MenuItemCard({ item }: { item: MenuItem }) {
  const { items, addItem, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.item.id === item.id);
  const qty = cartItem?.quantity ?? 0;

  return (
    <div className="bg-[#22232B] border border-[#2E3038] rounded-xl overflow-hidden hover:border-[#D4A017]/40 transition-all group">
      {/* Image */}
      <div className="relative h-44 bg-[#1A1B21]">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">🍔</span>
          </div>
        )}
        {!item.available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-[#CCCCCC] text-sm font-medium">No disponible</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-[#F5F0E8] font-semibold text-base mb-1">{item.name}</h3>
        {item.description && (
          <p className="text-[#888899] text-xs mb-3 line-clamp-2">{item.description}</p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[#D4A017] font-bold text-lg">
            ${item.price.toLocaleString("es-CO")}
          </span>

          {item.available && (
            <>
              {qty === 0 ? (
                <button
                  onClick={() => addItem(item)}
                  className="flex items-center gap-1 bg-[#D4A017] hover:bg-[#E8B830] text-[#111217] font-semibold text-sm px-3 py-1.5 rounded-lg transition-colors"
                >
                  <ShoppingCart size={14} />
                  Agregar
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, qty - 1)}
                    className="w-7 h-7 rounded-full border border-[#D4A017] text-[#D4A017] flex items-center justify-center hover:bg-[#D4A017] hover:text-[#111217] transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-[#F5F0E8] font-semibold w-5 text-center">{qty}</span>
                  <button
                    onClick={() => addItem(item)}
                    className="w-7 h-7 rounded-full bg-[#D4A017] text-[#111217] flex items-center justify-center hover:bg-[#E8B830] transition-colors"
                  >
                    <Plus size={14} />
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
