import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import BannerCarousel from "@/components/home/BannerCarousel";
import { Banner } from "@/lib/types";

export const revalidate = 60;

export default async function Home() {
  const supabase = await createClient();

  const { data: banners } = await supabase
    .from("banners")
    .select("*")
    .eq("active", true)
    .order("sort_order");

  const activeBanners: Banner[] = banners ?? [];

  return (
    <main className="min-h-screen bg-[#0F1117] flex flex-col items-center px-6 pt-8 pb-24 text-center">

      {/* Carrusel de banners */}
      {activeBanners.length > 0 && (
        <div className="w-full max-w-xs mb-6">
          <BannerCarousel banners={activeBanners} />
        </div>
      )}

      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <Image
          src="/logo-real.png"
          alt="ParillaBurgers"
          width={240}
          height={187}
          priority
          className="brightness-0 invert drop-shadow-[0_0_24px_rgba(255,255,255,0.12)]"
        />
        <p className="text-white italic text-lg mt-3 font-medium tracking-wide">
          ¡ A la parrilla sabe mejor !
        </p>
      </div>

      {/* Barra libre banner */}
      <div className="w-full max-w-xs bg-[#2A2414] border border-[#D4A017]/30 rounded-2xl px-4 py-3 flex items-center gap-3 mb-6">
        <span className="text-2xl">🥗</span>
        <p className="text-[#E8B830] text-xs font-medium text-left">
          Barra de ensalada libre con cada hamburguesa
        </p>
      </div>

      {/* Badges de features */}
      <div className="flex gap-2 flex-wrap justify-center mb-8">
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
        className="flex items-center justify-center gap-2 bg-[#D4A017] text-[#0F1117] font-bold text-base px-8 py-4 rounded-2xl w-full max-w-xs shadow-[0_4px_20px_rgba(212,160,23,0.3)] active:scale-95 transition-transform"
      >
        Ver Menú
        <ArrowRight size={18} />
      </Link>

    </main>
  );
}
