"use client";
import { useState } from "react";
import { Printer } from "lucide-react";

const APP_URL = "https://parrillaburgers.vercel.app";

export default function MesasPage() {
  const [totalMesas, setTotalMesas] = useState(10);

  const qrUrl = (mesa: number) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${APP_URL}/mesa/${mesa}`)}&bgcolor=1A1B21&color=D4A017&qzone=1`;

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#F5F0E8]">Códigos QR de Mesas</h1>
          <p className="text-[#888899] text-sm mt-1">Imprime y pega el QR en cada mesa — los clientes escanean y piden directamente</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-[#CCCCCC] text-sm">Número de mesas:</label>
          <input
            type="number"
            min={1}
            max={50}
            value={totalMesas}
            onChange={(e) => setTotalMesas(Number(e.target.value))}
            className="w-20 bg-[#1A1B21] border border-[#2E3038] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4A017]"
          />
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-[#D4A017] hover:bg-[#E8B830] text-[#111217] font-bold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <Printer size={16} /> Imprimir todo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 print:grid-cols-3">
        {Array.from({ length: totalMesas }, (_, i) => i + 1).map((mesa) => (
          <div
            key={mesa}
            className="bg-[#1A1B21] border border-[#2E3038] rounded-2xl p-4 flex flex-col items-center gap-3 print:border print:border-gray-300 print:rounded-xl print:bg-white"
          >
            <p className="text-[#D4A017] font-black text-lg print:text-black">Mesa {mesa}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl(mesa)}
              alt={`QR Mesa ${mesa}`}
              width={160}
              height={160}
              className="rounded-lg"
            />
            <div className="text-center">
              <p className="text-[#888899] text-xs print:text-gray-500">Escanea para pedir</p>
              <p className="text-[#555566] text-[10px] mt-0.5 print:text-gray-400">ParillaBurgers</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
