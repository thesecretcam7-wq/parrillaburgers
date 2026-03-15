"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Order, OrderStatus } from "@/lib/types";
import { CheckCircle, Clock, ChefHat, Bike, Package } from "lucide-react";
import { Suspense } from "react";

const STATUS_STEPS: { key: OrderStatus; label: string; icon: React.ReactNode; desc: string }[] = [
  { key: "confirmed", label: "Confirmado", icon: <CheckCircle size={22} />, desc: "Tu pedido fue recibido y confirmado" },
  { key: "preparing", label: "Preparando", icon: <ChefHat size={22} />, desc: "El equipo está preparando tu pedido" },
  { key: "on_the_way", label: "En camino", icon: <Bike size={22} />, desc: "Tu pedido está en camino" },
  { key: "delivered", label: "Entregado", icon: <Package size={22} />, desc: "¡Que lo disfrutes!" },
];

const STATUS_ORDER: OrderStatus[] = ["pending", "confirmed", "preparing", "on_the_way", "delivered"];

function TrackingContent() {
  const params = useSearchParams();
  const orderNumber = params.get("order");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(orderNumber ?? "");
  const [searchValue, setSearchValue] = useState(orderNumber ?? "");

  useEffect(() => {
    if (!searchValue) { setLoading(false); return; }

    const supabase = createClient();
    setLoading(true);

    const fetch = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", searchValue)
        .single();
      setOrder(data);
      setLoading(false);
    };
    fetch();

    // Realtime subscription
    const channel = supabase
      .channel(`order-${searchValue}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "orders",
        filter: `order_number=eq.${searchValue}`,
      }, (payload) => {
        setOrder(payload.new as Order);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [searchValue]);

  const currentStep = order ? STATUS_ORDER.indexOf(order.status) : -1;

  return (
    <main className="min-h-screen bg-[#111217] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-[#D4A017] text-sm uppercase tracking-widest mb-2">Estado del pedido</p>
          <h1 className="text-4xl font-black text-[#F5F0E8]">Seguimiento</h1>
        </div>

        {/* Search */}
        <div className="bg-[#22232B] border border-[#2E3038] rounded-xl p-5 mb-8">
          <label className="text-[#CCCCCC] text-sm mb-2 block">Número de pedido</label>
          <div className="flex gap-3">
            <input
              className="flex-1 bg-[#1A1B21] border border-[#2E3038] rounded-lg px-4 py-2.5 text-[#F5F0E8] placeholder-[#888899] focus:outline-none focus:border-[#D4A017] transition-colors text-sm"
              placeholder="PB-XXXXXX"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
            />
            <button
              onClick={() => setSearchValue(searchInput)}
              className="bg-[#D4A017] hover:bg-[#E8B830] text-[#111217] font-bold px-5 py-2.5 rounded-lg transition-colors text-sm"
            >
              Buscar
            </button>
          </div>
        </div>

        {loading && searchValue && (
          <div className="text-center py-12 text-[#888899]">Buscando pedido...</div>
        )}

        {!loading && searchValue && !order && (
          <div className="text-center py-12 bg-[#22232B] border border-[#2E3038] rounded-xl">
            <p className="text-[#888899]">No encontramos el pedido <strong className="text-[#F5F0E8]">{searchValue}</strong></p>
          </div>
        )}

        {order && (
          <div className="bg-[#22232B] border border-[#2E3038] rounded-xl p-6">
            {/* Order header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[#888899] text-xs">Número de pedido</p>
                <p className="text-[#D4A017] font-bold text-lg">{order.order_number}</p>
              </div>
              <div className="text-right">
                <p className="text-[#888899] text-xs">Total</p>
                <p className="text-[#F5F0E8] font-bold">${order.total?.toLocaleString("es-CO")}</p>
              </div>
            </div>

            {/* Status steps */}
            <div className="space-y-4 mb-6">
              {STATUS_STEPS.map((step, i) => {
                const stepIndex = STATUS_ORDER.indexOf(step.key);
                const isDone = currentStep >= stepIndex;
                const isActive = currentStep === stepIndex;
                const isCancelled = order.status === "cancelled";

                return (
                  <div key={step.key} className={`flex items-center gap-4 p-3 rounded-lg transition-all ${isActive ? "bg-[#D4A017]/10 border border-[#D4A017]/30" : ""}`}>
                    <div className={`shrink-0 rounded-full p-2 ${isDone && !isCancelled ? "bg-[#D4A017] text-[#111217]" : "bg-[#2E3038] text-[#888899]"}`}>
                      {step.icon}
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${isDone && !isCancelled ? "text-[#F5F0E8]" : "text-[#888899]"}`}>
                        {step.label}
                        {isActive && <span className="ml-2 text-[#D4A017] text-xs animate-pulse">● Ahora</span>}
                      </p>
                      <p className="text-[#888899] text-xs">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {order.status === "cancelled" && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-center">
                <p className="text-red-400 text-sm">Pedido cancelado</p>
              </div>
            )}

            {/* Items */}
            <div className="border-t border-[#2E3038] pt-4">
              <p className="text-[#CCCCCC] text-xs mb-3">Productos</p>
              <div className="space-y-1">
                {(order.items as any[])?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-[#CCCCCC]">{item.menu_item_name} x{item.quantity}</span>
                    <span className="text-[#F5F0E8]">${item.subtotal?.toLocaleString("es-CO")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!searchValue && (
          <div className="text-center py-12 text-[#888899]">
            <Clock className="mx-auto mb-3" size={40} />
            <p>Ingresa tu número de pedido para ver el estado</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function TrackingPage() {
  return (
    <Suspense>
      <TrackingContent />
    </Suspense>
  );
}
