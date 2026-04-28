"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Minus, X, Star, Flame } from "lucide-react";
import { MenuItem } from "@/lib/types";
import { useCartStore } from "@/lib/store/cart";
import { getProductRating, ProductRating } from "@/lib/supabase/ratings";
import BarraLibreSheet from "./BarraLibreSheet";
import ProductReviewsModal from "./ProductReviewsModal";

export default function MenuItemCard({ item }: { item: MenuItem }) {
  const { items, addItem, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.item.id === item.id);
  const qty = cartItem?.quantity ?? 0;
  const [showSheet, setShowSheet] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [rating, setRating] = useState<ProductRating | null>(null);
  const [loadingRating, setLoadingRating] = useState(true);

  const hasBarraLibre = item.barra_libre_items && item.barra_libre_items.length > 0;

  // Fetch rating when component mounts
  useEffect(() => {
    const fetchRating = async () => {
      try {
        const ratingData = await getProductRating(item.id);
        setRating(ratingData);
      } catch (error) {
        console.error("Error fetching rating:", error);
      } finally {
        setLoadingRating(false);
      }
    };

    fetchRating();
  }, [item.id]);

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
      <div className="card-base card-hover bg-gradient-to-br from-[#1C1800] to-[#16130A] rounded-xl overflow-hidden flex flex-col h-full">
        {/* Image section — larger */}
        <button
          type="button"
          onClick={() => setShowDetail(true)}
          className="relative h-48 bg-[#22242C] w-full text-left overflow-hidden group"
        >
          {item.image_url ? (
            <Image src={item.image_url} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2A2210] to-[#16130A]">
              <span className="text-7xl">🍔</span>
            </div>
          )}

          {/* Overlay badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Disponibilidad */}
          {!item.available && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
              <span className="text-white text-sm font-bold bg-red-600 px-4 py-2 rounded-full">
                No disponible
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
            {hasBarraLibre && (
              <div className="bg-gradient-to-r from-[#D4A017] to-[#E8B92A] text-[#0F1117] text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg">
                🥗 BARRA LIBRE
              </div>
            )}
            {rating && rating.count > 0 && (
              <div className="bg-black/60 backdrop-blur-sm text-[#D4A017] text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Star size={10} className="fill-[#D4A017]" />
                {rating.average.toFixed(1)}
              </div>
            )}
          </div>

          {/* Hot badge */}
          {rating && rating.count > 100 && (
            <div className="absolute bottom-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <Flame size={12} /> Popular
            </div>
          )}
        </button>

        {/* Info section */}
        <div className="p-4 flex flex-col flex-1">
          {/* Name — clickable */}
          <button
            type="button"
            onClick={() => setShowDetail(true)}
            className="text-left group"
          >
            <h3 className="text-white font-black text-base leading-tight group-hover:text-[#D4A017] transition-colors">
              {item.name}
            </h3>
            {item.description && (
              <p className="text-[#9CA3AF] text-xs mt-1 line-clamp-2">
                {item.description}
              </p>
            )}
          </button>

          {cartItem?.barra_libre_selected && cartItem.barra_libre_selected.length > 0 && (
            <p className="text-[#D4A017] text-xs mt-1.5 font-semibold truncate">
              🥗 {cartItem.barra_libre_selected.join(", ")}
            </p>
          )}

          {/* Rating clickable */}
          {!loadingRating && rating && rating.count > 0 && (
            <button
              onClick={() => setShowReviews(true)}
              className="flex items-center gap-1.5 mt-2 text-xs hover:opacity-80 transition-opacity group"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={
                      i < Math.floor(rating.average)
                        ? "fill-[#D4A017] text-[#D4A017]"
                        : i < rating.average
                        ? "fill-[#D4A017] text-[#D4A017] opacity-50"
                        : "text-[#4B5563]"
                    }
                  />
                ))}
              </div>
              <span className="text-[#D4A017] font-bold group-hover:underline">{rating.average.toFixed(1)}</span>
              <span className="text-[#6B7280]">({rating.count})</span>
            </button>
          )}

          {/* Price and controls */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#2A2210]">
            <span className="text-[#D4A017] font-black text-lg">
              ${Number(item.price).toLocaleString("es-CO")}
            </span>

            {item.available && (
              <>
                {qty === 0 ? (
                  <button
                    onClick={handleAdd}
                    className="bg-gradient-to-r from-[#D4A017] to-[#E8B92A] hover:shadow-gold text-[#0F1117] rounded-full p-2.5 font-bold transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                    title="Agregar al carrito"
                  >
                    <Plus size={18} strokeWidth={3} />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-[#1C1800] rounded-full px-2 py-1 border border-[#D4A017]">
                    <button
                      onClick={() => updateQuantity(item.id, qty - 1)}
                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#2E3038] transition-colors"
                    >
                      <Minus size={14} className="text-[#D4A017]" strokeWidth={2.5} />
                    </button>
                    <span className="text-[#D4A017] font-bold text-sm min-w-[20px] text-center">
                      {qty}
                    </span>
                    <button
                      onClick={handleAdd}
                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#2E3038] transition-colors"
                    >
                      <Plus size={14} className="text-[#D4A017]" strokeWidth={2.5} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {showDetail && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-[2px] z-50 flex items-end sm:items-center justify-center pb-16 sm:pb-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setShowDetail(false)}
        >
          <div
            className="modal-base bg-[#16130A] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm overflow-hidden animate-in slide-up duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="relative h-52 bg-[#1C1800]">
              {item.image_url ? (
                <Image src={item.image_url} alt={item.name} fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-7xl">🍔</span>
                </div>
              )}
              <button
                onClick={() => setShowDetail(false)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <X size={16} />
              </button>
              {hasBarraLibre && (
                <div className="absolute top-3 left-3 bg-[#D4A017] text-[#0F1117] text-[10px] font-bold px-2.5 py-1 rounded-full">
                  🥗 Barra libre
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className="text-white font-bold text-lg leading-tight">{item.name}</h2>
                <span className="text-[#D4A017] font-black text-xl shrink-0">
                  ${Number(item.price).toLocaleString("es-CO")}
                </span>
              </div>

              {item.description && (
                <p className="text-[#9CA3AF] text-sm leading-relaxed">{item.description}</p>
              )}

              {item.available ? (
                <button
                  onClick={() => { handleAdd(); setShowDetail(false); }}
                  className="mt-5 w-full py-3 bg-gradient-to-r from-[#D4A017] to-[#E8B92A] text-[#0F1117] font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-gold hover:scale-105 active:scale-95"
                >
                  Agregar al carrito
                </button>
              ) : (
                <div className="mt-5 w-full py-3 bg-[#1C1800] text-[#6B7280] font-semibold rounded-xl text-center text-sm">
                  No disponible
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Barra libre selector sheet */}
      {showSheet && (
        <BarraLibreSheet
          item={item}
          onConfirm={handleConfirm}
          onClose={() => setShowSheet(false)}
        />
      )}

      {/* Reviews modal */}
      {showReviews && rating && (
        <ProductReviewsModal
          productName={item.name}
          rating={rating}
          onClose={() => setShowReviews(false)}
        />
      )}
    </>
  );
}
