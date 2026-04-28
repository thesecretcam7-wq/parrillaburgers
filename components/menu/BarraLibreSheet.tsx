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
      {/* Overlay — above BottomNav (z-50) */}
      <div
        className="fixed inset-0 bg-black/70 z-[55]"
        onClick={onClose}
      />

      {/* Bottom sheet — above overlay */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] bg-[#1A1B21] border-t border-[#2E3038] rounded-t-3xl shadow-xl max-w-[430px] mx-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#2E3038] rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-1 pb-3 border-b border-[#2E3038]">
          <div>
            <h3 className="text-[#F5F0E8] font-bold text-base">{item.name}</h3>
            <p className="text-[#888899] text-xs mt-0.5">Elige los ingredientes de la barra libre</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#22242C] flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <X size={16} className="text-[#888899]" />
          </button>
        </div>

        {/* Options grid */}
        <div className="px-5 py-4 grid grid-cols-2 gap-2 max-h-56 overflow-y-auto">
          {opciones.map((opcion) => {
            const isSelected = selected.includes(opcion);
            return (
              <button
                key={opcion}
                onClick={() => toggle(opcion)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 text-left ${
                  isSelected
                    ? "border-[#D4A017] bg-[#D4A017]/10"
                    : "border-[#2E3038] bg-[#22242C]"
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${
                  isSelected ? "bg-[#D4A017]" : "bg-[#2E3038]"
                }`}>
                  {isSelected && <Check size={12} className="text-[#111217]" strokeWidth={3} />}
                </div>
                <span className={`text-sm font-medium leading-tight ${
                  isSelected ? "text-[#D4A017]" : "text-[#CCCCCC]"
                }`}>
                  {opcion}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 pt-3 pb-8 border-t border-[#2E3038]">
          {selected.length > 0 && (
            <p className="text-[#888899] text-xs mb-3 text-center">
              Seleccionado: <span className="text-[#D4A017] font-medium">{selected.join(" · ")}</span>
            </p>
          )}
          <button
            onClick={() => onConfirm(selected)}
            className="w-full bg-[#D4A017] text-[#111217] font-bold py-3.5 rounded-2xl text-sm shadow-md hover:shadow-gold hover:scale-105 active:scale-95 transition-all duration-200"
          >
            {selected.length === 0 ? "Agregar sin barra libre" : `Agregar con ${selected.length} ingrediente${selected.length > 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </>
  );
}
