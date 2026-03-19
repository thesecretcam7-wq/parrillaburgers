"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Banner } from "@/lib/types";

interface Props {
  banners: Banner[];
}

export default function BannerCarousel({ banners }: Props) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = banners.length;

  const next = () => setCurrent((c) => (c + 1) % count);
  const prev = () => setCurrent((c) => (c - 1 + count) % count);

  const resetInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(next, 4000);
  };

  useEffect(() => {
    if (count <= 1) return;
    resetInterval();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  if (count === 0) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      delta < 0 ? next() : prev();
      resetInterval();
    }
    touchStartX.current = null;
  };

  const goTo = (idx: number) => {
    setCurrent(idx);
    resetInterval();
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden rounded-2xl"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      <div className="relative h-full w-full">
        {banners.map((banner, idx) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          >
            {banner.image_url ? (
              <Image
                src={banner.image_url}
                alt={banner.title ?? "Banner"}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 640px"
                priority={banner.sort_order === 1}
              />
            ) : (
              <div className="w-full h-full bg-[#2A2414] flex items-center justify-center">
                <span className="text-[#D4A017] text-4xl">🍔</span>
              </div>
            )}

            {/* Overlay gradiente */}
            {(banner.title || banner.subtitle) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            )}

            {/* Texto */}
            {(banner.title || banner.subtitle) && (
              <div className="absolute bottom-7 left-4 right-4">
                {banner.title && (
                  <p className="text-white font-bold text-base leading-tight drop-shadow-md">
                    {banner.title}
                  </p>
                )}
                {banner.subtitle && (
                  <p className="text-white/80 text-xs mt-0.5 drop-shadow-md">
                    {banner.subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dots */}
      {count > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              aria-label={`Ir al banner ${idx + 1}`}
              className={`rounded-full transition-all duration-300 ${
                idx === current
                  ? "w-5 h-1.5 bg-[#D4A017]"
                  : "w-1.5 h-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
