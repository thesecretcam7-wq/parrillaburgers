"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Minus } from "lucide-react";
import { MenuItem } from "@/lib/types";
import { useCartStore } from "@/lib/store/cart";
import BarraLibreSheet from "./BarraLibreSheet";

export default function MenuItemCard({ item }: { item: MenuItem }) {
  const { items, addItem, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.item.id === item.id);
  const qty = cartItem?.quantity ?? 0;
  const [showSheet, setShowSheet] = useState(false);

  const hasBarraLibre = item.barra_libre_items && item.barra_libre_items.length > 0;

  const handleAdd = () => {
    if (hasBarraLibre) {
      setShowSheet(true);
    } else {
      addItem(item);
    }
  };

  const handleConfirm = (selected: string[]) => {
    addItem(item, selected);
    setShowSheet(false);
  };

  return (
    <>
      <div className="bg-[#1A1B21] rounded-2xl overflow-hidden border border-[#2E3038] flex flex-col hover:border-[#D4A017]/50 hover:scale-[1.03] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-all duration-200">
        {/* Image */}
        <div className="relative h-36 bg-[#22242C]">
          {item.image_url ? (
            <Image src={item.image_url} alt={item.name} fill className="object-cover" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl">🍔</span>
            </div>
          )}
          {!item.available && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-[#9CA3AF] text-xs font-semibold bg-[#1A1B21] px-3 py-1 rounded-full border border-[#2E3038]">
                No disponible
              </span>
            </div>
          )}
          {/* Barra libre badge */}
          {hasBarraLibre && (
            <div className="absolute top-2 left-2 bg-[#D4A017] text-[#0F1117] text-[9px] font-bold px-2 py-0.5 rounded-full">
              🥗 Barra libre
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1">
          <h3 className="text-white font-bold text-sm leading-tight">{item.name}</h3>
          {item.description && (
            <p className="text-[#6B7280] text-[11px] mt-0.5 line-clamp-2 flex-1">{item.description}</p>
          )}

          {/* Barra libre selected preview */}
          {cartItem?.barra_libre_selected && cartItem.barra_libre_selected.length > 0 && (
            <p className="text-[#D4A017] text-[10px] mt-1 truncate">
              🥗 {cartItem.barra_libre_selected.join(", ")}
            </p>
          )}

          <div className="flex items-center justify-between mt-2.5">
            <span className="text-[#D4A017] font-black text-base">
              ${Number(item.price).toLocaleString("es-CO")}
            </span>

            {item.available && (
              <>
                {qty === 0 ? (
                  <button
                    onClick={handleAdd}
                    className="w-7 h-7 bg-[#D4A017] rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-sm"
                  >
                    <Plus size={16} className="text-[#0F1117]" strokeWidth={2.5} />
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQuantity(item.id, qty - 1)}
                      className="w-6 h-6 rounded-full border-2 border-[#D4A017] flex items-center justify-center"
                    >
                      <Minus size={11} className="text-[#D4A017]" strokeWidth={2.5} />
                    </button>
                    <span className="text-white font-bold text-sm w-4 text-center">{qty}</span>
                    <button
                      onClick={handleAdd}
                      className="w-6 h-6 rounded-full bg-[#D4A017] flex items-center justify-center"
                    >
                      <Plus size={11} className="text-[#0F1117]" strokeWidth={2.5} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Barra libre selector sheet */}
      {showSheet && (
        <BarraLibreSheet
          item={item}
          onConfirm={handleConfirm}
          onClose={() => setShowSheet(false)}
        />
      )}
    </>
  );
}
