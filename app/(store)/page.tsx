import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import BannerCarousel from "@/components/home/BannerCarousel";
import { Banner } from "@/lib/types";

export const revalidate = 60;

export default async function Home() {
  const supabase = await createClient();

  const [{ data: banners }, { data: settings }] = await Promise.all([
    supabase.from("banners").select("*").eq("active", true).order("sort_order"),
    supabase.from("settings").select("*").in("key", ["barra_libre_activa", "barra_libre_texto", "barra_libre_emoji"]),
  ]);

  const activeBanners: Banner[] = banners ?? [];

  const settingsMap: Record<string, string> = {};
  (settings ?? []).forEach((s: { key: string; value: string }) => { settingsMap[s.key] = s.value; });
  const barraActiva = settingsMap["barra_libre_activa"] !== "false";
  const barraTexto = settingsMap["barra_libre_texto"] ?? "Barra de ensalada libre con cada hamburguesa";
  const barraEmoji = settingsMap["barra_libre_emoji"] ?? "🥗";

  return (
    <main className="h-[100dvh] bg-[#0F1117] flex flex-col items-center justify-between px-6 py-8 text-center overflow-hidden">

      {/* Logo */}
      <div className="flex-1 flex items-center justify-center">
        <Image
          src="/logo-real.png"
          alt="ParillaBurgers"
          width={260}
          height={222}
          priority
          className="brightness-0 invert drop-shadow-[0_0_24px_rgba(255,255,255,0.12)] w-auto max-h-[30dvh]"
        />
      </div>

      {/* Carrusel de banners */}
      {activeBanners.length > 0 && (
        <div className="w-full max-w-xs shrink-0">
          <BannerCarousel banners={activeBanners} />
        </div>
      )}

      {/* Barra libre + badges + CTA */}
      <div className="w-full max-w-xs flex flex-col items-center gap-4 shrink-0 mt-4">

        {barraActiva && (
          <p className="text-white text-sm font-medium">{barraTexto}</p>
        )}

        {/* Badges de features */}
        <div className="flex gap-2 flex-wrap justify-center">
          {[
            { icon: "🚴", label: "Domicilio" },
            { icon: "🎯", label: "Puntos" },
            { icon: "⚡", label: "Tiempo real" },
          ].map(({ icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 bg-[#1A1B21] border border-[#2E3038] text-[#9CA3AF] text-xs font-medium px-3 py-1.5 rounded-full"
            >
              <span>{icon}</span> {label}
            </span>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/menu"
          className="flex items-center justify-center gap-2 bg-[#D4A017] text-[#0F1117] font-bold text-base px-8 py-4 rounded-2xl w-full shadow-[0_4px_20px_rgba(212,160,23,0.3)] hover:shadow-[0_6px_32px_rgba(212,160,23,0.55)] hover:scale-[1.03] active:scale-95 transition-all duration-200"
        >
          Ver Menú
          <ArrowRight size={18} />
        </Link>

      </div>

    </main>
  );
}
