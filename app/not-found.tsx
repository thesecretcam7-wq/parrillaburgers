import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0F1117] flex flex-col items-center justify-center px-6 text-center pb-24">
      <div className="mb-6">
        <Image
          src="/logo-real.png"
          alt="ParillaBurgers"
          width={160}
          height={136}
          className="brightness-0 invert opacity-50 mx-auto"
        />
      </div>
      <p className="text-[#D4A017] font-black text-7xl mb-2">404</p>
      <h1 className="text-white font-bold text-xl mb-2">Página no encontrada</h1>
      <p className="text-[#6B7280] text-sm mb-8 max-w-xs">
        Esta página no existe o fue movida. Vuelve al menú y sigue pidiendo.
      </p>
      <Link
        href="/menu"
        className="bg-[#D4A017] text-[#0F1117] font-bold px-8 py-3 rounded-xl text-sm"
      >
        Ver Menú
      </Link>
    </main>
  );
}
