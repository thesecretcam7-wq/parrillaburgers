"use client";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function MesaPage() {
  const router = useRouter();
  const params = useParams();
  const numero = String(params.numero ?? "");

  useEffect(() => {
    if (numero) localStorage.setItem("pb-mesa", numero);
    router.replace("/menu");
  }, [numero, router]);

  return (
    <main className="min-h-screen bg-[#0F1117] flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">🍔</div>
        <p className="text-[#D4A017] font-bold text-lg">Mesa {numero}</p>
        <p className="text-[#6B7280] text-sm mt-1">Cargando menú...</p>
      </div>
    </main>
  );
}
