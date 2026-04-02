"use client";

import { MessageCircle } from "lucide-react";
import { useState } from "react";

const WHATSAPP_NUMBER = "573216539508"; // Sin el + ni espacios

export default function FloatingWhatsApp() {
  const [showMenu, setShowMenu] = useState(false);

  const handleWhatsAppClick = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(url, "_blank");
    setShowMenu(false);
  };

  return (
    <>
      {/* Menu expandible */}
      {showMenu && (
        <div className="fixed bottom-28 right-6 z-40 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            onClick={() => handleWhatsAppClick("Hola, tengo una pregunta sobre mi pedido")}
            className="flex items-center gap-3 bg-[#22242C] hover:bg-[#2E3038] border border-[#D4A017]/40 rounded-full px-4 py-2.5 text-white text-sm font-semibold transition-all"
          >
            <span>📦</span>
            Mis pedidos
          </button>

          <button
            onClick={() => handleWhatsAppClick("Hola, tengo un problema con mi pedido")}
            className="flex items-center gap-3 bg-[#22242C] hover:bg-[#2E3038] border border-[#D4A017]/40 rounded-full px-4 py-2.5 text-white text-sm font-semibold transition-all"
          >
            <span>⚠️</span>
            Reportar problema
          </button>

          <button
            onClick={() => handleWhatsAppClick("Hola, tengo una pregunta")}
            className="flex items-center gap-3 bg-[#22242C] hover:bg-[#2E3038] border border-[#D4A017]/40 rounded-full px-4 py-2.5 text-white text-sm font-semibold transition-all"
          >
            <span>❓</span>
            Consulta
          </button>
        </div>
      )}

      {/* Botón flotante principal */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 hover:shadow-[0_8px_24px_rgba(34,197,94,0.3)] shadow-lg flex items-center justify-center transition-all duration-300 ${
          showMenu ? "scale-110" : "hover:scale-110"
        }`}
        aria-label="Abrir WhatsApp"
      >
        <MessageCircle size={24} className="text-white" />
      </button>

      {/* Backdrop para cerrar menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowMenu(false)}
        />
      )}
    </>
  );
}
