"use client";

import { useState, useEffect } from "react";
import { Printer } from "lucide-react";
import { Order } from "@/lib/types";
import { printWithFallback, selectUSBPrinter } from "@/lib/utils/usb-printer";
import toast from "react-hot-toast";

interface PrintReceiptButtonProps {
  order: Order;
  className?: string;
  onAfterPrint?: () => Promise<void>;
}

export function PrintReceiptButton({ order, className = "", onAfterPrint }: PrintReceiptButtonProps) {
  const [printing, setPrinting] = useState(false);
  const [usbSupported, setUsbSupported] = useState(false);

  useEffect(() => {
    setUsbSupported(!!(navigator as any).usb);
  }, []);

  const handlePrint = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      setPrinting(true);

      // Si es la primera vez o WebUSB no está disponible, solicitar seleccionar impresora
      if (usbSupported && !localStorage.getItem("printer_configured")) {
        const success = await selectUSBPrinter();
        if (success) {
          localStorage.setItem("printer_configured", "true");
        }
      }

      await printWithFallback(order);
      toast.success("✓ Impreso");

      if (onAfterPrint) await onAfterPrint();
    } catch (error) {
      console.error("Error printing receipt:", error);
      toast.error("Error al imprimir");
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
      title="Imprimir pedido para cocina"
    >
      <Printer size={14} />
      {printing ? "Imprimiendo..." : "Imprimir"}
    </button>
  );
}
