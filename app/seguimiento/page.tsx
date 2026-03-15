"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Order, OrderStatus } from "@/lib/types";
import { CheckCircle, Clock, ChefHat, Bike, Package } from "lucide-react";
import { Suspense } from "react";

const STATUS_STEPS: { key: OrderStatus; label: string; icon: React.ReactNode; desc: string }[] = [
  { key: "confirmed", label: "Confirmado", icon: <CheckCircle size={20} />, desc: "Tu pedido fue recibido y confirmado" },
  { key: "preparing", label: "Preparando", icon: <ChefHat size={20} />, desc: "El equipo está preparando tu pedido" },
  { key: "on_the_way", label: "En camino", icon: <Bike size={20} />, desc: "Tu pedido está en camino" },
  { key: "delivered", label: "Entregado", icon: <Package size={20} />, desc: "¡Que lo disfrutes!" },
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

    const fetchOrder = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", searchValue)
        .single();
      setOrder(data);
      setLoading(false);
    };
    fetchOrder();

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
    <main className="min-h-screen bg-[#F4F4F5] px-4 py-4 pb-24">
      <div className="max-w-lg mx-auto space-y-3">

        {/* Search card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <label className="text-[#71717A] text-xs mb-2 block font-medium">Número de pedido</label>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-[#F4F4F5] border border-[#E4E4E7] rounded-xl px-4 py-2.5 text-[#111217] placeholder-[#9CA3AF] focus:outline-none focus:border-[#D4A017] transition-colors text-sm"
              placeholder="PB-XXXXXX"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
            />
            <button
              onClick={() => setSearchValue(searchInput)}
              className="bg-[#D4A017] text-white font-bold px-5 py-2.5 rounded-xl text-sm"
            >
              Buscar
            </button>
          </div>
        </div>

        {loading && searchValue && (
          <div className="text-center py-10 text-[#9CA3AF] text-sm">Buscando pedido...</div>
        )}

        {!loading && searchValue && !order && (
          <div className="text-center py-10 bg-white rounded-2xl shadow-sm">
            <p className="text-[#9CA3AF] text-sm">No encontramos el pedido <strong className="text-[#111217]">{searchValue}</strong></p>
          </div>
        )}

        {order && (
          <>
            {/* Order header card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[#9CA3AF] text-xs">Número de pedido</p>
                <p className="text-[#9CA3AF] text-xs">Total</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[#D4A017] font-bold">{order.order_number}</p>
                <p className="text-[#111217] font-bold">${order.total?.toLocaleString("es-CO")}</p>
              </div>
            </div>

            {/* Status steps card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-[#111217] font-bold text-sm mb-4">Estado del pedido</h3>
              <div className="space-y-3">
                {STATUS_STEPS.map((step) => {
                  const stepIndex = STATUS_ORDER.indexOf(step.key);
                  const isDone = currentStep >= stepIndex;
                  const isActive = currentStep === stepIndex;
                  const isCancelled = order.status === "cancelled";

                  return (
                    <div
                      key={step.key}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                        isActive && !isCancelled ? "bg-[#FDF3D7] border border-[#D4A017]/30" : "bg-[#F4F4F5]"
                      }`}
                    >
                      <div className={`shrink-0 rounded-full p-2 ${
                        isDone && !isCancelled ? "bg-[#D4A017] text-white" : "bg-[#E4E4E7] text-[#9CA3AF]"
                      }`}>
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${
                          isDone && !isCancelled ? "text-[#111217]" : "text-[#9CA3AF]"
                        }`}>
                          {step.label}
                          {isActive && !isCancelled && (
                            <span className="ml-2 text-[#D4A017] text-xs animate-pulse">● Ahora</span>
                          )}
                        </p>
                        <p className="text-[#9CA3AF] text-xs">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {order.status === "cancelled" && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                  <p className="text-red-500 text-sm font-medium">Pedido cancelado</p>
                </div>
              )}
            </div>

            {/* Items card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-[#111217] font-bold text-sm mb-3">Productos</h3>
              <div className="space-y-2">
                {(order.items as any[])?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-[#71717A]">{item.menu_item_name} <span className="text-[#9CA3AF]">x{item.quantity}</span></span>
                    <span className="text-[#111217] font-medium">${item.subtotal?.toLocaleString("es-CO")}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {!searchValue && (
          <div className="text-center py-12 text-[#9CA3AF]">
            <div className="w-16 h-16 rounded-full bg-[#E4E4E7] flex items-center justify-center mx-auto mb-3">
              <Clock size={32} className="text-[#9CA3AF]" />
            </div>
            <p className="text-sm">Ingresa tu número de pedido para ver el estado</p>
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
