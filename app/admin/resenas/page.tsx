"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Star } from "lucide-react";

type Review = {
  id: string;
  order_number: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={s <= rating ? "text-[#D4A017] fill-[#D4A017]" : "text-[#2E3038]"}
        />
      ))}
    </div>
  );
}

export default function ResenasPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetch = () =>
      supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          setReviews((data as Review[]) ?? []);
          setLoading(false);
        });

    fetch();

    const channel = supabase
      .channel("resenas-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "reviews" }, fetch)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const avg = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#F5F0E8]">Reseñas</h1>
        <p className="text-[#888899] text-sm mt-1">{reviews.length} reseña{reviews.length !== 1 ? "s" : ""}</p>
      </div>

      {loading ? (
        <p className="text-[#888899] text-center py-12">Cargando...</p>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 text-[#555566]">
          <Star size={40} className="mx-auto mb-3 opacity-40" />
          <p>Aún no hay reseñas</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-[#1A1B21] border border-[#2E3038] rounded-xl p-6 flex flex-col sm:flex-row gap-6 items-center">
            <div className="text-center">
              <p className="text-5xl font-black text-[#F5F0E8]">{avg}</p>
              <Stars rating={Math.round(Number(avg))} />
              <p className="text-[#888899] text-xs mt-1">{reviews.length} reseñas</p>
            </div>
            <div className="flex-1 w-full space-y-1.5">
              {dist.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-[#888899] text-xs w-3">{star}</span>
                  <Star size={11} className="text-[#D4A017] fill-[#D4A017] shrink-0" />
                  <div className="flex-1 bg-[#22232B] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#D4A017] h-full rounded-full transition-all"
                      style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="text-[#555566] text-xs w-4 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="bg-[#1A1B21] border border-[#2E3038] rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div>
                    <p className="text-[#F5F0E8] font-semibold text-sm">{r.customer_name}</p>
                    <p className="text-[#555566] text-xs">{r.order_number}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Stars rating={r.rating} />
                    <p className="text-[#555566] text-xs mt-1">
                      {new Date(r.created_at).toLocaleDateString("es-CO")}
                    </p>
                  </div>
                </div>
                {r.comment && (
                  <p className="text-[#CCCCCC] text-sm mt-2 leading-relaxed">{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
