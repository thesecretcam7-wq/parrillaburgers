"use client";

import { X, Star } from "lucide-react";
import { ProductRating } from "@/lib/supabase/ratings";

type Props = {
  productName: string;
  rating: ProductRating;
  onClose: () => void;
};

export default function ProductReviewsModal({
  productName,
  rating,
  onClose,
}: Props) {
  const renderStars = (value: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={14}
        className={
          i < Math.floor(value)
            ? "fill-[#D4A017] text-[#D4A017]"
            : i < value
            ? "fill-[#D4A017] text-[#D4A017] opacity-50"
            : "text-[#4B5563]"
        }
      />
    ));
  };

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-[2px] z-50 flex items-end sm:items-center justify-center pb-16 sm:pb-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#1A1B21] border border-[#2E3038] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm shadow-[0_-8px_40px_rgba(0,0,0,0.6)] sm:shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-[#2E3038] sticky top-0 bg-[#1A1B21]/95 backdrop-blur">
          <div>
            <h2 className="text-white font-bold text-lg">{productName}</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex gap-1">{renderStars(rating.average)}</div>
              <span className="text-[#D4A017] text-sm font-bold">
                {rating.average.toFixed(1)}
              </span>
              <span className="text-[#6B7280] text-sm">
                ({rating.count} {rating.count === 1 ? "reseña" : "reseñas"})
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#22242C] transition-colors"
          >
            <X size={20} className="text-[#9CA3AF]" />
          </button>
        </div>

        {/* Reviews list */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {rating.reviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#6B7280]">Sin reseñas aún</p>
            </div>
          ) : (
            rating.reviews.map((review) => (
              <div
                key={review.id}
                className="bg-[#22242C] rounded-lg p-4 border border-[#2E3038]"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-white text-sm font-semibold">
                      {review.customer_name}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <span className="text-[#6B7280] text-xs whitespace-nowrap">
                    {new Date(review.created_at).toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {review.comment && (
                  <p className="text-[#9CA3AF] text-sm leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
