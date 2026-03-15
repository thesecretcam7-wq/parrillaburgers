import Link from "next/link";
import { Phone, MapPin, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1A1B21] border-t border-[#2E3038] mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full border-2 border-[#D4A017] flex items-center justify-center bg-[#111217]">
              <span className="text-[#D4A017] font-bold text-xs">PB</span>
            </div>
            <span className="text-[#F5F0E8] font-bold text-lg">
              Parrilla<span className="text-[#D4A017]">Burgers</span>
            </span>
          </div>
          <p className="text-[#888899] text-sm">
            El mejor sabor a la parrilla. Hamburguesas artesanales con ingredientes frescos.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-[#D4A017] font-semibold mb-4">Navegación</h3>
          <div className="flex flex-col gap-2 text-sm text-[#CCCCCC]">
            <Link href="/" className="hover:text-[#D4A017] transition-colors">Inicio</Link>
            <Link href="/menu" className="hover:text-[#D4A017] transition-colors">Menú</Link>
            <Link href="/carrito" className="hover:text-[#D4A017] transition-colors">Carrito</Link>
            <Link href="/seguimiento" className="hover:text-[#D4A017] transition-colors">Seguir Pedido</Link>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-[#D4A017] font-semibold mb-4">Contacto</h3>
          <div className="flex flex-col gap-3 text-sm text-[#CCCCCC]">
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-[#D4A017] shrink-0" />
              <span>300 7784365 | (4) 5771856</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[#D4A017] shrink-0" />
              <span>Calle 9 #83AA-22, Medellín</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#D4A017] shrink-0" />
              <span>Lun–Dom: 5:00 PM – 11:00 PM</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#2E3038] py-4 text-center text-[#888899] text-xs">
        © {new Date().getFullYear()} ParillaBurgers. Todos los derechos reservados.
      </div>
    </footer>
  );
}
