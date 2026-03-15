import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Star, MapPin, Flame, ChevronRight } from "lucide-react";

const FEATURED = [
  { name: "Clásica", desc: "Carne artesanal · tocineta · queso", price: 9200, tag: "⭐ Popular", emoji: "🍔" },
  { name: "Argentina", desc: "Clásica + chimichurri artesanal", price: 10200, tag: "🔥 Top", emoji: "🥩" },
  { name: "Mexicana", desc: "Clásica + jalapeños", price: 10200, tag: "🌶️ Picante", emoji: "🌶️" },
  { name: "Doble", desc: "2 carnes · doble queso", price: 13500, tag: "💪 Grande", emoji: "🍔" },
];

const CATEGORIES = [
  { label: "Hamburguesas", emoji: "🍔", href: "/menu" },
  { label: "Combos", emoji: "🍟", href: "/menu" },
  { label: "Acompañamientos", emoji: "🌽", href: "/menu" },
  { label: "Otros", emoji: "🌭", href: "/menu" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F4F4F5] max-w-lg mx-auto">

      {/* Hero Banner */}
      <section className="mx-3 mt-3 rounded-3xl overflow-hidden bg-[#111217] relative"
        style={{ minHeight: 200 }}>
        {/* Gold glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,_#D4A01730_0%,_transparent_60%)]" />
        <div className="relative z-10 p-6 flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-[#D4A017] text-xs font-bold uppercase tracking-widest mb-2">
              🔥 El mejor sabor a la parrilla
            </p>
            <h1 className="text-white font-black text-2xl leading-tight mb-1">
              Hamburguesas<br />
              <span className="text-[#D4A017]">Artesanales</span>
            </h1>
            <p className="text-[#9CA3AF] text-xs mb-4">
              Ingredientes frescos · Barra de ensalada libre
            </p>
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 bg-[#D4A017] text-[#111217] font-bold text-sm px-5 py-2.5 rounded-2xl"
            >
              Pedir ahora <ArrowRight size={14} />
            </Link>
          </div>
          <div className="w-24 h-24 shrink-0 drop-shadow-[0_0_20px_rgba(212,160,23,0.5)]">
            <Image src="/logo.svg" alt="ParillaBurgers" width={96} height={96} priority />
          </div>
        </div>
        {/* Info row */}
        <div className="relative z-10 border-t border-white/10 flex divide-x divide-white/10">
          {[
            { icon: <Clock size={12} />, text: "30 min" },
            { icon: <Star size={12} />, text: "4.8 ★" },
            { icon: <MapPin size={12} />, text: "Belén, Medellín" },
          ].map((item, i) => (
            <div key={i} className="flex-1 flex items-center justify-center gap-1 py-2.5 text-[#9CA3AF] text-[11px]">
              <span className="text-[#D4A017]">{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>
      </section>

      {/* Promo strip */}
      <section className="mx-3 mt-3">
        <div className="bg-gradient-to-r from-[#D4A017] to-[#E8B830] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[#111217] font-black text-sm">🎯 Acumula puntos</p>
            <p className="text-[#111217]/70 text-xs">1 punto por cada $1.000 gastado</p>
          </div>
          <Link href="/seguimiento" className="bg-[#111217] text-white text-xs font-bold px-3 py-1.5 rounded-xl">
            Ver mis puntos
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="mt-5 px-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-[#111217] text-base">Categorías</h2>
          <Link href="/menu" className="text-[#D4A017] text-xs font-semibold flex items-center gap-0.5">
            Ver todo <ChevronRight size={12} />
          </Link>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="flex flex-col items-center gap-1.5 bg-white rounded-2xl px-4 py-3 shrink-0 shadow-sm border border-[#F0F0F0] min-w-[72px]"
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-[10px] font-semibold text-[#374151] text-center leading-tight">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured items */}
      <section className="mt-5 px-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-[#111217] text-base">⭐ Más Pedidos</h2>
          <Link href="/menu" className="text-[#D4A017] text-xs font-semibold flex items-center gap-0.5">
            Ver menú <ChevronRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {FEATURED.map((item, i) => (
            <Link key={i} href="/menu" className="bg-white rounded-2xl p-4 shadow-sm border border-[#F0F0F0] block active:scale-95 transition-transform">
              <div className="text-4xl mb-2 text-center">{item.emoji}</div>
              <span className="inline-block bg-[#FDF3D7] text-[#B8860B] text-[9px] font-bold px-2 py-0.5 rounded-full mb-1.5">
                {item.tag}
              </span>
              <h3 className="font-bold text-[#111217] text-sm">{item.name}</h3>
              <p className="text-[#9CA3AF] text-[10px] mt-0.5 line-clamp-1">{item.desc}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[#D4A017] font-black text-sm">${item.price.toLocaleString("es-CO")}</span>
                <div className="w-6 h-6 bg-[#D4A017] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-black">+</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features strip */}
      <section className="mt-5 px-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: <Flame size={18} className="text-[#D4A017]" />, label: "Parrilla\nArtesanal" },
            { icon: <Clock size={18} className="text-[#D4A017]" />, label: "Tracking\nen vivo" },
            { icon: <Star size={18} className="text-[#D4A017]" />, label: "Puntos\npor compra" },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-2xl p-3 text-center shadow-sm border border-[#F0F0F0]">
              <div className="flex justify-center mb-1.5">{f.icon}</div>
              <p className="text-[10px] font-semibold text-[#374151] leading-tight whitespace-pre-line">{f.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Address card */}
      <section className="mt-4 mx-3 mb-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#F0F0F0] flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FDF3D7] rounded-xl flex items-center justify-center shrink-0">
            <MapPin size={18} className="text-[#D4A017]" />
          </div>
          <div>
            <p className="text-[#111217] font-semibold text-sm">Calle 9 #83AA-22, Belén</p>
            <p className="text-[#9CA3AF] text-xs">WhatsApp · (4) 5771856</p>
          </div>
          <ChevronRight size={16} className="text-[#D4D4D8] ml-auto" />
        </div>
      </section>

    </main>
  );
}
