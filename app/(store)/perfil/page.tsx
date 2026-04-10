"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, Mail, Phone, MapPin, Gift, LogOut } from "lucide-react";
import toast from "react-hot-toast";

type CustomerData = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

export default function PerfilPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        // Load from localStorage
        const saved = localStorage.getItem("pb-customer");
        if (saved) {
          const data = JSON.parse(saved) as CustomerData;
          setCustomer(data);

          // Fetch points from Supabase
          const supabase = createClient();
          const { data: customerData } = await supabase
            .from("customers")
            .select("points")
            .eq("email", data.email)
            .single();

          if (customerData) {
            setPoints(customerData.points || 0);
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCustomerData();
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("pb-customer");
      localStorage.removeItem("pb-last-order");
      toast.success("Sesión cerrada");
      router.push("/");
    } catch (error) {
      toast.error("Error al cerrar sesión");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1117] flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A017] mx-auto mb-4" />
          <p className="text-white">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-[#0F1117] flex items-center justify-center pt-16">
        <div className="text-center px-6">
          <User size={48} className="text-[#D4A017] mx-auto mb-4 opacity-50" />
          <h2 className="text-white text-lg font-bold mb-2">Sin perfil</h2>
          <p className="text-gray-400 mb-6">Debes realizar un pedido primero</p>
          <button
            onClick={() => router.push("/menu")}
            className="bg-[#D4A017] text-black px-6 py-2 rounded-full font-semibold hover:bg-[#E8B92A] transition-colors"
          >
            Ir al Menú
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1117] pt-20 pb-20 px-4">
      <div className="max-w-[430px] mx-auto">
        {/* Profile Header */}
        <div className="bg-[#16130A] rounded-2xl p-6 mb-6 border border-[#2A2210]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#D4A017] to-[#B8860B] rounded-full flex items-center justify-center">
              <User size={32} className="text-black" />
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold">{customer.name}</h1>
              <p className="text-gray-400 text-sm">{customer.email}</p>
            </div>
          </div>

          {/* Points Card */}
          <div className="bg-[#0F1117] rounded-lg p-4 border border-[#2A2210] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gift size={24} className="text-[#D4A017]" />
              <div>
                <p className="text-gray-400 text-sm">Puntos disponibles</p>
                <p className="text-white text-xl font-bold">{points.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs">= ${(points / 100 * 1000).toLocaleString()}</p>
              <p className="text-[#D4A017] text-xs font-semibold">descuento</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-[#16130A] rounded-2xl p-6 mb-6 border border-[#2A2210]">
          <h2 className="text-white text-lg font-bold mb-4">Información de Contacto</h2>

          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-start gap-3">
              <Mail size={20} className="text-[#D4A017] mt-1 shrink-0" />
              <div>
                <p className="text-gray-400 text-sm">Correo</p>
                <p className="text-white text-sm break-all">{customer.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3">
              <Phone size={20} className="text-[#D4A017] mt-1 shrink-0" />
              <div>
                <p className="text-gray-400 text-sm">Teléfono</p>
                <p className="text-white text-sm">{customer.phone || "No registrado"}</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-[#D4A017] mt-1 shrink-0" />
              <div>
                <p className="text-gray-400 text-sm">Dirección</p>
                <p className="text-white text-sm">{customer.address || "No registrada"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => router.push("/mis-pedidos")}
            className="w-full bg-[#16130A] hover:bg-[#1C1800] text-white py-3 rounded-xl font-semibold transition-colors border border-[#2A2210]"
          >
            Ver Mis Pedidos
          </button>

          <button
            onClick={() => router.push("/menu")}
            className="w-full bg-[#D4A017] hover:bg-[#E8B92A] text-[#0F1117] py-3 rounded-xl font-bold transition-colors"
          >
            Continuar Comprando
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-red-900/20 hover:bg-red-900/30 text-red-400 py-3 rounded-xl font-semibold transition-colors border border-red-800/30 flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>

        {/* Info */}
        <div className="text-center text-gray-500 text-xs">
          <p>Tus datos se guardan de forma segura en tus dispositivos</p>
          <p className="mt-2">Para cambiar información, edítala en el siguiente pedido</p>
        </div>
      </div>
    </div>
  );
}
