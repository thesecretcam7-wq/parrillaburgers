"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import { Order } from "@/lib/types";
import { printThermalReceipt } from "@/lib/utils/thermal-receipt";
import toast from "react-hot-toast";

interface PrintReceiptButtonProps {
  order: Order;
  className?: string;
}

export function PrintReceiptButton({ order, className = "" }: PrintReceiptButtonProps) {
  const [printing, setPrinting] = useState(false);

  const handlePrint = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      setPrinting(true);
      printThermalReceipt(order);
      toast.success("Recibo enviado a la impresora");
    } catch (error) {
      console.error("Error printing receipt:", error);
      toast.error("Error al imprimir el recibo");
    } finally {
      setPrinting(false);
    }
  };

  return (
    <button
      onClick={handlePrint}
      disabled={printing}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
        printing
          ? "bg-[#2E3038] border-[#2E3038] text-[#888899] cursor-not-allowed"
          : "border-[#2E3038] text-[#CCCCCC] hover:border-[#D4A017] hover:text-[#D4A017] hover:bg-[#D4A017]/5"
      } ${className}`}
      title="Imprimir recibo para la cocina"
    >
      <Printer size={14} />
      {printing ? "Imprimiendo..." : "Imprimir"}
    </button>
  );
}
