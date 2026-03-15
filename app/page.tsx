import Link from "next/link";
import { ArrowRight, Star, Clock, MapPin, Flame } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#111217]">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#111217] via-[#1A1B21] to-[#111217]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#D4A01715_0%,_transparent_70%)]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          {/* Logo circle */}
          <div className="flex justify-center mb-8">
            <div className="w-28 h-28 rounded-full border-4 border-[#D4A017] bg-[#1A1B21] flex flex-col items-center justify-center shadow-[0_0_40px_#D4A01740]">
              <span className="text-[#D4A017] font-black text-2xl leading-none">PB</span>
              <span className="text-[#888899] text-[9px] uppercase tracking-widest mt-0.5">Parrilla</span>
            </div>
          </div>

          <p className="text-[#D4A017] text-sm font-semibold uppercase tracking-[0.3em] mb-4">
            El mejor sabor a la parrilla
          </p>
          <h1 className="text-5xl md:text-7xl font-black text-[#F5F0E8] mb-6 leading-tight">
            Parrilla<br />
            <span className="text-[#D4A017]">Burgers</span>
          </h1>
          <p className="text-[#CCCCCC] text-lg md:text-xl mb-10 max-w-xl mx-auto">
            Hamburguesas artesanales a la parrilla. Ingredientes frescos, sabor inigualable.
            Pide online y recíbelo en tu puerta.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-[#D4A017] hover:bg-[#E8B830] text-[#111217] font-bold px-8 py-4 rounded-xl transition-all hover:shadow-[0_0_20px_#D4A01760] text-base"
            >
              Ver Menú
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/seguimiento"
              className="inline-flex items-center gap-2 border border-[#2E3038] hover:border-[#D4A017] text-[#CCCCCC] hover:text-[#D4A017] font-semibold px-8 py-4 rounded-xl transition-all text-base"
            >
              Seguir Pedido
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[#888899] text-xs">
          <span>Descubre más</span>
          <div className="w-0.5 h-8 bg-gradient-to-b from-[#888899] to-transparent" />
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Flame className="text-[#D4A017]" size={28} />,
              title: "Parrilla Artesanal",
              desc: "Carne 100% artesanal cocida a la parrilla con técnica argentina.",
            },
            {
              icon: <Clock className="text-[#D4A017]" size={28} />,
              title: "Delivery en Tiempo Real",
              desc: "Sigue tu pedido en vivo: recibido → preparando → en camino.",
            },
            {
              icon: <Star className="text-[#D4A017]" size={28} />,
              title: "Puntos por Compra",
              desc: "Acumula puntos con cada pedido y canjéalos por descuentos.",
            },
          ].map((f, i) => (
            <div key={i} className="bg-[#22232B] border border-[#2E3038] rounded-xl p-6 hover:border-[#D4A017]/40 transition-colors">
              <div className="mb-4">{f.icon}</div>
              <h3 className="text-[#F5F0E8] font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-[#888899] text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Menu preview */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[#D4A017] text-sm uppercase tracking-widest mb-2">Nuestros productos</p>
          <h2 className="text-4xl font-black text-[#F5F0E8]">Menú Destacado</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { name: "Clásica", price: "9.200", emoji: "🍔" },
            { name: "Argentina", price: "10.200", emoji: "🥩" },
            { name: "Mexicana", price: "10.200", emoji: "🌶️" },
            { name: "Doble", price: "13.500", emoji: "🍔" },
          ].map((item, i) => (
            <div key={i} className="bg-[#22232B] border border-[#2E3038] rounded-xl p-5 text-center hover:border-[#D4A017]/40 transition-colors">
              <div className="text-4xl mb-3">{item.emoji}</div>
              <h4 className="text-[#F5F0E8] font-semibold mb-1">{item.name}</h4>
              <p className="text-[#D4A017] font-bold">${item.price}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-[#D4A017] hover:bg-[#E8B830] text-[#111217] font-bold px-8 py-3 rounded-xl transition-colors"
          >
            Ver menú completo
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Address */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto bg-[#22232B] border border-[#2E3038] rounded-2xl p-8 text-center">
          <MapPin className="text-[#D4A017] mx-auto mb-4" size={32} />
          <h3 className="text-[#F5F0E8] font-bold text-xl mb-2">Encuéntranos</h3>
          <p className="text-[#CCCCCC]">Calle 9 #83AA-22, Medellín, Belén</p>
          <p className="text-[#888899] text-sm mt-2">
            Servicio a domicilio: WhatsApp 300 7784365
          </p>
        </div>
      </section>
    </main>
  );
}
