import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Flame, Clock, Award, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import BannerCarousel from "@/components/home/BannerCarousel";
import LockScroll from "@/components/home/LockScroll";
import { Banner, MenuItem } from "@/lib/types";

const HORARIO_APERTURA = 18; // 6pm
const HORARIO_CIERRE = 23.99; // 11:59pm

function isOpenBySchedule(): boolean {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(now);
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0");
  const currentHour = hour + minute / 60;
  return currentHour >= HORARIO_APERTURA && currentHour < HORARIO_CIERRE;
}

export const revalidate = 60;

type SpecialOffer = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  active: boolean;
};

export default async function Home() {
  const supabase = await createClient();

  const [{ data: banners }, { data: settings }, { data: items }, { data: specials }] = await Promise.all([
    supabase.from("banners").select("*").eq("active", true).order("sort_order"),
    supabase.from("settings").select("*").in("key", ["barra_libre_activa", "barra_libre_texto", "barra_libre_emoji"]),
    supabase.from("menu_items").select("*").eq("available", true).limit(6),
    supabase.from("specials_offers").select("*").eq("active", true).order("sort_order"),
  ]);

  const activeBanners: Banner[] = banners ?? [];

  const settingsMap: Record<string, string> = {};
  (settings ?? []).forEach((s: { key: string; value: string }) => { settingsMap[s.key] = s.value; });
  const barraActiva = settingsMap["barra_libre_activa"] !== "false";
  const barraTexto = settingsMap["barra_libre_texto"] ?? "Barra de ensalada libre con cada hamburguesa";
  const barraEmoji = settingsMap["barra_libre_emoji"] ?? "🥗";

  const menuItems = (items ?? []) as MenuItem[];

  // Ofertas especiales con fallback a valores por defecto
  const specialOffers = (specials ?? []) as SpecialOffer[];
  const defaultOffers: SpecialOffer[] = [
    { id: "1", title: "Combo Hamburguesero", emoji: "🍔", description: "Hasta -30%", active: true },
    { id: "2", title: "Acompañamientos", emoji: "🍟", description: "Compra 2, lleva 3", active: true },
    { id: "3", title: "Parrilla a la Brasa", emoji: "🔥", description: "Jugosas y tiernas", active: true },
    { id: "4", title: "Gana Puntos", emoji: "🎯", description: "100 pts = $1.000", active: true },
  ];
  const offersToDisplay = specialOffers.length > 0 ? specialOffers : defaultOffers;

  const isOpen = isOpenBySchedule();

  return (
    <main className="min-h-screen bg-[#0F1117] pb-8">
      {/* Hero — textura diagonal metal oscuro igual a la imagen */}
      <div className="relative overflow-hidden" style={{
        backgroundColor: "#080604",
        backgroundImage: [
          /* glow cálido central — igual al de la imagen */
          "radial-gradient(ellipse 90% 80% at 50% 55%, rgba(140,80,0,0.18) 0%, rgba(100,50,0,0.08) 40%, transparent 70%)",
          /* líneas diagonales gruesas — grano de madera/metal oscuro */
          "repeating-linear-gradient(-40deg, transparent 0px, transparent 6px, rgba(18,12,4,0.85) 6px, rgba(18,12,4,0.85) 8px, transparent 8px, transparent 14px, rgba(28,20,8,0.5) 14px, rgba(28,20,8,0.5) 16px)",
          /* líneas diagonales finas encima — profundidad */
          "repeating-linear-gradient(-40deg, transparent 0px, transparent 2px, rgba(8,5,2,0.4) 2px, rgba(8,5,2,0.4) 3px)",
          /* degradado superior oscuro */
          "linear-gradient(180deg, rgba(4,3,2,0.6) 0%, transparent 30%, transparent 70%, rgba(4,3,2,0.4) 100%)",
        ].join(", "),
      }}>
        {/* Radial glow behind logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-80 h-80 rounded-full bg-[#C47800]/8 blur-3xl" />
        </div>
        <div className="relative py-6 px-2 text-center flex flex-col items-center">
          {/* Logo con overlay */}
          <div className="relative">
            {/* Capa metálica dorada encima del logo — blend overlay */}
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background: "linear-gradient(135deg, rgba(255,230,120,0.22) 0%, rgba(200,140,20,0.12) 25%, rgba(80,50,0,0.08) 50%, rgba(180,120,20,0.14) 75%, rgba(255,220,100,0.2) 100%)",
                mixBlendMode: "overlay",
              }}
            />
            <Image
              src="/logo-real.png"
              alt="ParillaBurgers"
              width={300}
              height={300}
              priority
              className="relative w-auto h-64"
              style={{
                transform: "scale(1.45)",
                transformOrigin: "center center",
                filter: [
                  "contrast(1.35)",
                  "brightness(1.08)",
                  "saturate(1.3)",
                  "drop-shadow(0px 8px 20px rgba(0,0,0,0.95))",
                  "drop-shadow(0px 3px 6px rgba(0,0,0,0.85))",
                  "drop-shadow(-2px -2px 3px rgba(255,200,80,0.35))",
                  "drop-shadow(3px 3px 6px rgba(0,0,0,0.7))",
                ].join(" "),
              }}
            />
          </div>
          {/* Slogan */}
          <p className="mt-1 text-[#D4A017] text-2xl" style={{ fontFamily: "var(--font-dancing)" }}>
            ¡A la parrilla sabe mejor!
          </p>
          {/* Horario badge */}
          <div className={`inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full text-xs font-semibold ${
            isOpen
              ? "bg-green-900/40 border border-green-700/50 text-green-400"
              : "bg-red-900/40 border border-red-700/50 text-red-400"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-green-400" : "bg-red-400"}`} />
            {isOpen ? "Abierto ahora · 6:00 PM - 11:59 PM" : "Cerrado · Abrimos a las 6:00 PM"}
          </div>
        </div>
        {/* Gold bottom border */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#D4A017]/40 to-transparent" />
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

        {/* Ofertas cards — dinámicas desde Supabase */}
        <div className="grid grid-cols-2 gap-4">
          {offersToDisplay.map((offer) => (
            <Link
              key={offer.id}
              href="/menu"
              className="relative overflow-hidden rounded-2xl p-4 hover:scale-[1.02] active:scale-95 transition-all duration-200"
              style={{ background: "linear-gradient(135deg, #C4820A 0%, #8B5A00 60%, #5C3A00 100%)" }}
            >
              {/* Shine overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              <div className="relative">
                <div className="text-4xl mb-3 drop-shadow-md">{offer.emoji}</div>
                <p className="text-white font-black text-sm leading-tight">{offer.title}</p>
                <p className="text-[#FFD878] text-xs mt-1 font-semibold">{offer.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Productos populares */}
      {menuItems.length > 0 && (
        <div className="px-6 py-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Award size={20} className="text-[#D4A017]" />
            <h2 className="text-white text-xl font-black">Lo Más Popular</h2>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {menuItems.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                href="/menu"
                className="bg-[#16130A] rounded-2xl overflow-hidden border border-[#2A2210] hover:border-[#D4A017]/50 hover:shadow-[0_4px_20px_rgba(212,160,23,0.12)] transition-all duration-300 flex gap-4"
              >
                {/* Image */}
                <div className="relative w-24 h-24 shrink-0 bg-[#0D0B06]">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🍔</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
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
                  <div className="bg-[#D4A017]/15 border border-[#D4A017]/30 text-[#D4A017] px-2 py-1 rounded-full text-xs font-bold">
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
          <div className="flex items-center gap-3 border-2 border-[#D4A017]/60 px-4 py-3 rounded-2xl" style={{ background: "linear-gradient(135deg, #1A1200 0%, #2A1E00 100%)" }}>
            <span className="text-2xl">{barraEmoji}</span>
            <div>
              <p className="font-bold text-[#D4A017] text-sm">Barra Libre Incluida</p>
              <p className="text-[#9CA3AF] text-xs">{barraTexto}</p>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#16130A] border border-[#2A2210] rounded-xl p-3 text-center hover:border-[#D4A017]/40 transition-colors">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/emojis/scooter.png" alt="" width={24} height={24} className="object-contain mx-auto mb-2" />
            <p className="text-white text-xs font-bold">Domicilio</p>
          </div>
          <div className="bg-[#16130A] border border-[#2A2210] rounded-xl p-3 text-center hover:border-[#D4A017]/40 transition-colors">
            <span className="text-2xl">🎯</span>
            <p className="text-white text-xs font-bold mt-1">Puntos</p>
          </div>
          <div className="bg-[#16130A] border border-[#2A2210] rounded-xl p-3 text-center hover:border-[#D4A017]/40 transition-colors">
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
