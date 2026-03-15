import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0F1117] flex flex-col items-center justify-center px-6 text-center">

      {/* Logo */}
      <div className="w-24 h-24 rounded-full bg-[#D4A017] flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(212,160,23,0.35)]">
        <Image src="/logo.svg" alt="ParillaBurgers" width={56} height={56} priority />
      </div>

      {/* Nombre */}
      <h1 className="text-4xl font-black text-white leading-none mb-1">
        Parrilla<span className="text-[#D4A017]">Burgers</span>
      </h1>
      <p className="text-[#9CA3AF] text-sm mb-8">El mejor sabor a la parrilla</p>

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
