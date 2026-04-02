import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Flame, Clock, Award } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import BannerCarousel from "@/components/home/BannerCarousel";
import LockScroll from "@/components/home/LockScroll";
import { Banner, MenuItem } from "@/lib/types";

export const revalidate = 60;

export default async function Home() {
  const supabase = await createClient();

  const [{ data: banners }, { data: settings }, { data: items }] = await Promise.all([
    supabase.from("banners").select("*").eq("active", true).order("sort_order"),
    supabase.from("settings").select("*").in("key", ["barra_libre_activa", "barra_libre_texto", "barra_libre_emoji"]),
    supabase.from("menu_items").select("*").eq("available", true).limit(6),
  ]);

  const activeBanners: Banner[] = banners ?? [];

  const settingsMap: Record<string, string> = {};
  (settings ?? []).forEach((s: { key: string; value: string }) => { settingsMap[s.key] = s.value; });
  const barraActiva = settingsMap["barra_libre_activa"] !== "false";
  const barraTexto = settingsMap["barra_libre_texto"] ?? "Barra de ensalada libre con cada hamburguesa";
  const barraEmoji = settingsMap["barra_libre_emoji"] ?? "🥗";

  const menuItems = (items ?? []) as MenuItem[];

  return (
    <main className="min-h-screen bg-[#0F1117] pb-8">
      <LockScroll />

      {/* Header con Logo */}
      <div className="sticky top-14 z-40 bg-gradient-to-b from-[#0F1117] to-[#0F1117]/90 backdrop-blur-md border-b border-[#2E3038]/30 py-4 px-6 text-center">
        <Image
          src="/logo-real.png"
          alt="ParillaBurgers"
          width={120}
          height={100}
          priority
          className="brightness-0 invert drop-shadow-[0_0_16px_rgba(255,255,255,0.08)] w-auto h-12 mx-auto"
        />
      </div>

      {/* Carrusel de banners — más grande */}
      {activeBanners.length > 0 && (
        <div className="px-6 py-6">
          <BannerCarousel banners={activeBanners} />
        </div>
      )}

      {/* Ofertas especiales destacadas */}
      <div className="px-6 py-6 space-y-4">
        {/* Título */}
        <div className="flex items-center gap-2 mb-4">
          <Flame size={20} className="text-[#D4A017]" />
          <h2 className="text-white text-xl font-black">Ofertas Especiales</h2>
        </div>

        {/* Ofertas cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Oferta 1: Hamburguesas */}
          <Link
            href="/menu"
            className="bg-gradient-to-br from-[#2E3038] to-[#22242C] border border-[#3A3F4A] rounded-2xl p-4 hover:border-[#D4A017]/50 hover:shadow-[0_8px_24px_rgba(212,160,23,0.15)] transition-all duration-300"
          >
            <div className="text-2xl mb-2">🍔</div>
            <p className="text-white font-black text-sm leading-tight">Combo Hamburguesero</p>
            <p className="text-[#D4A017] text-xs mt-1 font-semibold">Hasta -30%</p>
          </Link>

          {/* Oferta 2: Acompañamientos */}
          <Link
            href="/menu"
            className="bg-gradient-to-br from-[#2E3038] to-[#22242C] border border-[#3A3F4A] rounded-2xl p-4 hover:border-[#D4A017]/50 hover:shadow-[0_8px_24px_rgba(212,160,23,0.15)] transition-all duration-300"
          >
            <div className="text-2xl mb-2">🍟</div>
            <p className="text-white font-black text-sm leading-tight">Acompañamientos</p>
            <p className="text-[#D4A017] text-xs mt-1 font-semibold">Compra 2, lleva 3</p>
          </Link>

          {/* Oferta 3: Asados */}
          <Link
            href="/menu"
            className="bg-gradient-to-br from-[#2E3038] to-[#22242C] border border-[#3A3F4A] rounded-2xl p-4 hover:border-[#D4A017]/50 hover:shadow-[0_8px_24px_rgba(212,160,23,0.15)] transition-all duration-300"
          >
            <div className="text-2xl mb-2">🔥</div>
            <p className="text-white font-black text-sm leading-tight">Parrilla a la Brasa</p>
            <p className="text-[#9CA3AF] text-xs mt-1">Jugosas y tiernas</p>
          </Link>

          {/* Oferta 4: Puntos */}
          <Link
            href="/menu"
            className="bg-gradient-to-br from-[#2E3038] to-[#22242C] border border-[#3A3F4A] rounded-2xl p-4 hover:border-[#D4A017]/50 hover:shadow-[0_8px_24px_rgba(212,160,23,0.15)] transition-all duration-300"
          >
            <div className="text-2xl mb-2">🎯</div>
            <p className="text-white font-black text-sm leading-tight">Gana Puntos</p>
            <p className="text-[#D4A017] text-xs mt-1 font-semibold">100 pts = $1.000</p>
          </Link>
        </div>
      </div>

      {/* Productos populares */}
      {menuItems.length > 0 && (
        <div className="px-6 py-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Award size={20} className="text-[#D4A017]" />
            <h2 className="text-white text-xl font-black">Lo Más Popular</h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {menuItems.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                href="/menu"
                className="bg-gradient-to-r from-[#22242C] to-[#1A1B21] rounded-2xl overflow-hidden border border-[#2E3038] hover:border-[#D4A017] hover:shadow-[0_8px_24px_rgba(212,160,23,0.15)] transition-all duration-300 flex gap-4"
              >
                {/* Image */}
                <div className="relative w-24 h-24 shrink-0 bg-[#1A1B21]">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🍔</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                {/* Info */}
                <div className="flex flex-col justify-center flex-1 pr-4">
                  <h3 className="text-white font-black text-sm leading-tight">{item.name}</h3>
                  <p className="text-[#9CA3AF] text-xs mt-1 line-clamp-1">{item.description}</p>
                  <p className="text-[#D4A017] font-black text-base mt-2">
                    ${Number(item.price).toLocaleString("es-CO")}
                  </p>
                </div>

                {/* Badge */}
                <div className="flex items-center pr-4">
                  <div className="bg-[#D4A017]/20 text-[#D4A017] px-2 py-1 rounded-full text-xs font-bold">
                    ⭐ Popular
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Barra libre + Features */}
      <div className="px-6 py-6 space-y-4">
        {barraActiva && (
          <div className="flex items-center gap-3 bg-[#22242C] border-2 border-[#D4A017] px-4 py-3 rounded-2xl">
            <span className="text-2xl">{barraEmoji}</span>
            <div>
              <p className="font-bold text-white text-sm">Barra Libre Incluida</p>
              <p className="text-[#9CA3AF] text-xs">{barraTexto}</p>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#22242C] border border-[#2E3038] rounded-xl p-3 text-center hover:border-[#D4A017]/40 transition-colors">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/emojis/scooter.png" alt="" width={24} height={24} className="object-contain mx-auto mb-2" />
            <p className="text-white text-xs font-bold">Domicilio</p>
          </div>
          <div className="bg-[#22242C] border border-[#2E3038] rounded-xl p-3 text-center hover:border-[#D4A017]/40 transition-colors">
            <span className="text-2xl">🎯</span>
            <p className="text-white text-xs font-bold mt-1">Puntos</p>
          </div>
          <div className="bg-[#22242C] border border-[#2E3038] rounded-xl p-3 text-center hover:border-[#D4A017]/40 transition-colors">
            <Clock size={20} className="mx-auto mb-1 text-[#D4A017]" />
            <p className="text-white text-xs font-bold">En vivo</p>
          </div>
        </div>
      </div>

      {/* CTA principal */}
      <div className="px-6 py-8">
        <Link
          href="/menu"
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4A017] to-[#E8B92A] text-[#0F1117] font-black text-lg px-8 py-4 rounded-2xl w-full shadow-[0_8px_24px_rgba(212,160,23,0.3)] hover:shadow-[0_12px_40px_rgba(212,160,23,0.5)] hover:scale-[1.02] active:scale-95 transition-all duration-200"
        >
          Ver Menú Completo
          <ArrowRight size={20} />
        </Link>
      </div>

    </main>
  );
}
