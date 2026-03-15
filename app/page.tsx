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
    <main className="min-h-screen bg-[#F4F4F5] max-w-lg lg:max-w-5xl mx-auto px-3 py-3 space-y-4">

      {/* Hero Banner */}
      <section className="rounded-3xl overflow-hidden bg-[#111217] relative" style={{ minHeight: 200 }}>
        {/* Gold glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,_#D4A01730_0%,_transparent_60%)]" />
        <div className="relative z-10 p-6 lg:p-10 flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-[#D4A017] text-xs lg:text-sm font-bold uppercase tracking-widest mb-2">
              🔥 El mejor sabor a la parrilla
            </p>
            <h1 className="text-white font-black text-2xl lg:text-4xl leading-tight mb-1">
              Hamburguesas<br />
              <span className="text-[#D4A017]">Artesanales</span>
            </h1>
            <p className="text-[#9CA3AF] text-xs lg:text-sm mb-4 lg:mb-6">
              Ingredientes frescos · Barra de ensalada libre
            </p>
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 bg-[#D4A017] text-[#111217] font-bold text-sm lg:text-base px-5 lg:px-7 py-2.5 lg:py-3 rounded-2xl"
            >
              Pedir ahora <ArrowRight size={14} />
            </Link>
          </div>
          <div className="w-24 h-24 lg:w-40 lg:h-40 shrink-0 drop-shadow-[0_0_20px_rgba(212,160,23,0.5)]">
            <Image src="/logo.svg" alt="ParillaBurgers" width={160} height={160} priority />
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

      {/* Desktop: 2 columnas | Mobile: 1 columna */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-4 space-y-4 lg:space-y-0">

        {/* Columna izquierda (2/3) — Categorías + Más Pedidos */}
        <div className="lg:col-span-2 space-y-4">

          {/* Categories */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-black text-[#111217] text-base">Categorías</h2>
              <Link href="/menu" className="text-[#D4A017] text-xs font-semibold flex items-center gap-0.5">
                Ver todo <ChevronRight size={12} />
              </Link>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 lg:overflow-visible lg:grid lg:grid-cols-4">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="flex flex-col items-center gap-1.5 bg-white rounded-2xl px-4 py-3 shrink-0 lg:shrink shadow-sm border border-[#F0F0F0] min-w-[72px] lg:min-w-0 hover:border-[#D4A017] transition-colors"
                >
                  <span className="text-2xl lg:text-3xl">{cat.emoji}</span>
                  <span className="text-[10px] lg:text-xs font-semibold text-[#374151] text-center leading-tight">{cat.label}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Featured items */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-black text-[#111217] text-base">⭐ Más Pedidos</h2>
              <Link href="/menu" className="text-[#D4A017] text-xs font-semibold flex items-center gap-0.5">
                Ver menú <ChevronRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {FEATURED.map((item, i) => (
                <Link
                  key={i}
                  href="/menu"
                  className="bg-white rounded-2xl p-4 shadow-sm border border-[#F0F0F0] block hover:border-[#D4A017] hover:shadow-md transition-all active:scale-95"
                >
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
        </div>

        {/* Columna derecha (1/3) — Promo + Features + Dirección */}
        <div className="lg:col-span-1 space-y-4">

          {/* Promo strip */}
          <section>
            <div className="bg-gradient-to-r from-[#D4A017] to-[#E8B830] rounded-2xl p-4 flex items-center justify-between lg:flex-col lg:items-start lg:gap-3">
              <div>
                <p className="text-[#111217] font-black text-sm">🎯 Acumula puntos</p>
                <p className="text-[#111217]/70 text-xs">1 punto por cada $1.000 gastado</p>
              </div>
              <Link href="/seguimiento" className="bg-[#111217] text-white text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap">
                Ver mis puntos
              </Link>
            </div>
          </section>

          {/* Features strip */}
          <section>
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
              {[
                { icon: <Flame size={18} className="text-[#D4A017]" />, label: "Parrilla Artesanal", desc: "Cocinado a la leña" },
                { icon: <Clock size={18} className="text-[#D4A017]" />, label: "Tracking en vivo", desc: "Sigue tu pedido" },
                { icon: <Star size={18} className="text-[#D4A017]" />, label: "Puntos por compra", desc: "1 pt x $1.000" },
              ].map((f, i) => (
                <div key={i} className="bg-white rounded-2xl p-3 lg:p-4 text-center lg:text-left lg:flex lg:items-center lg:gap-3 shadow-sm border border-[#F0F0F0]">
                  <div className="flex justify-center lg:justify-start mb-1.5 lg:mb-0 lg:w-8 lg:h-8 lg:bg-[#FDF3D7] lg:rounded-xl lg:items-center lg:shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-[10px] lg:text-sm font-semibold text-[#374151] leading-tight">{f.label}</p>
                    <p className="hidden lg:block text-[#9CA3AF] text-xs mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Address card */}
          <section>
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

        </div>
      </div>

    </main>
  );
}
