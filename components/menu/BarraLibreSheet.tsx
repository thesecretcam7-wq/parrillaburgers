"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { MenuItem } from "@/lib/types";

interface BarraLibreSheetProps {
  item: MenuItem;
  onConfirm: (selected: string[]) => void;
  onClose: () => void;
}

export default function BarraLibreSheet({ item, onConfirm, onClose }: BarraLibreSheetProps) {
  const opciones = item.barra_libre_items ?? [];
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (opcion: string) => {
    setSelected((prev) =>
      prev.includes(opcion) ? prev.filter((o) => o !== opcion) : [...prev, opcion]
    );
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-w-lg mx-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#E4E4E7] rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-[#F4F4F5]">
          <div>
            <h3 className="text-[#111217] font-bold text-base">{item.name}</h3>
            <p className="text-[#9CA3AF] text-xs mt-0.5">Elige los ingredientes de la barra libre</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F4F5] flex items-center justify-center"
          >
            <X size={16} className="text-[#71717A]" />
          </button>
        </div>

        {/* Options grid */}
        <div className="px-5 py-4 grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
          {opciones.map((opcion) => {
            const isSelected = selected.includes(opcion);
            return (
              <button
                key={opcion}
                onClick={() => toggle(opcion)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? "border-[#D4A017] bg-[#FDF3D7]"
                    : "border-[#E4E4E7] bg-white"
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${
                  isSelected ? "bg-[#D4A017]" : "bg-[#F4F4F5]"
                }`}>
                  {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                </div>
                <span className={`text-sm font-medium leading-tight ${
                  isSelected ? "text-[#B8860B]" : "text-[#374151]"
                }`}>
                  {opcion}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 pb-6 pt-3 border-t border-[#F4F4F5]">
          {selected.length > 0 && (
            <p className="text-[#9CA3AF] text-xs mb-3 text-center">
              Seleccionado: <span className="text-[#D4A017] font-medium">{selected.join(" · ")}</span>
            </p>
          )}
          <button
            onClick={() => onConfirm(selected)}
            className="w-full bg-[#D4A017] text-white font-bold py-3.5 rounded-2xl text-sm active:scale-98 transition-transform"
          >
            {selected.length === 0 ? "Agregar sin barra libre" : `Agregar con ${selected.length} ingrediente${selected.length > 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </>
  );
}
