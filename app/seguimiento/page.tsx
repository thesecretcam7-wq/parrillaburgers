"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Order, OrderStatus } from "@/lib/types";
import { CheckCircle, Clock, ChefHat, Bike, Package, ShoppingBag } from "lucide-react";
import { Suspense } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

const STATUS_STEPS: { key: OrderStatus; label: string; icon: React.ReactNode; desc: string }[] = [
  { key: "confirmed",  label: "Confirmado", icon: <CheckCircle size={20} />, desc: "Tu pedido fue recibido y confirmado" },
  { key: "preparing",  label: "Preparando", icon: <ChefHat size={20} />,     desc: "El equipo está preparando tu pedido" },
  { key: "on_the_way", label: "En camino",  icon: <Bike size={20} />,        desc: "Tu pedido está en camino" },
  { key: "delivered",  label: "Entregado",  icon: <Package size={20} />,     desc: "¡Que lo disfrutes!" },
];

const STATUS_ORDER: OrderStatus[] = ["pending", "confirmed", "preparing", "on_the_way", "delivered"];

function TrackingContent() {
  const params = useSearchParams();
  const urlOrder        = params.get("order");
  const wompiTxId       = params.get("id");
  const [order, setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const verifiedRef = useRef(false);

  // Resolve order number: URL param → localStorage fallback
  useEffect(() => {
    const resolved = urlOrder ?? localStorage.getItem("pb-last-order");
    setOrderNumber(resolved);
    if (!resolved) setLoading(false);
  }, [urlOrder]);

  // Verify Wompi payment when redirected from Wompi
  useEffect(() => {
    if (!wompiTxId || !urlOrder || verifiedRef.current) return;
    verifiedRef.current = true;
    (async () => {
      try {
        const res  = await fetch("/api/wompi/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId: wompiTxId, orderNumber: urlOrder }),
        });
        const data = await res.json();
        if (data.status === "APPROVED")      toast.success("¡Pago aprobado! Tu pedido está en camino 🎉");
        else if (data.status === "PENDING")  toast("Pago en proceso, te notificaremos pronto", { icon: "⏳" });
        else                                 toast.error("El pago no fue aprobado. Contacta soporte si ya fue cobrado.");
      } catch { /* silent */ }
    })();
  }, [wompiTxId, urlOrder]);

  // Fetch order + realtime subscription
  useEffect(() => {
    if (!orderNumber) return;
    const supabase = createClient();
    setLoading(true);

    supabase.from("orders").select("*").eq("order_number", orderNumber).single()
      .then(({ data }) => { setOrder(data); setLoading(false); });

    const channel = supabase
      .channel(`order-${orderNumber}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "orders",
        filter: `order_number=eq.${orderNumber}`,
      }, (payload) => setOrder(payload.new as Order))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderNumber]);

  const currentStep  = order ? STATUS_ORDER.indexOf(order.status) : -1;

  // ── No order ──────────────────────────────────────────────────────────────
  if (!loading && !orderNumber) {
    return (
      <main className="min-h-screen bg-[#0F1117] flex flex-col items-center justify-center px-4 pb-24">
        <div className="w-16 h-16 rounded-full bg-[#22242C] flex items-center justify-center mb-4">
          <ShoppingBag size={28} className="text-[#6B7280]" />
        </div>
        <p className="text-white font-bold mb-1">Sin pedido activo</p>
        <p className="text-[#9CA3AF] text-sm mb-6 text-center">Aún no has hecho ningún pedido.</p>
        <Link
          href="/menu"
          className="bg-[#D4A017] text-[#0F1117] font-bold px-6 py-3 rounded-xl text-sm"
        >
          Ver Menú
        </Link>
      </main>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen bg-[#0F1117] flex items-center justify-center pb-24">
        <p className="text-[#9CA3AF] text-sm animate-pulse">Cargando tu pedido...</p>
      </main>
    );
  }

  // ── Order not found ───────────────────────────────────────────────────────
  if (!order) {
    return (
      <main className="min-h-screen bg-[#0F1117] flex flex-col items-center justify-center px-4 pb-24">
        <p className="text-white font-bold mb-1">Pedido no encontrado</p>
        <p className="text-[#9CA3AF] text-sm mb-6">{orderNumber}</p>
        <Link href="/menu" className="bg-[#D4A017] text-[#0F1117] font-bold px-6 py-3 rounded-xl text-sm">
          Ver Menú
        </Link>
      </main>
    );
  }

  // ── Order found ───────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#0F1117] px-4 py-4 pb-24">
      <div className="max-w-lg mx-auto space-y-3">

        {/* Header */}
        <div className="bg-[#1A1B21] rounded-2xl p-5 border border-[#2E3038]">
          <div className="flex justify-between items-center mb-1">
            <p className="text-[#9CA3AF] text-xs">Número de pedido</p>
            <p className="text-[#9CA3AF] text-xs">Total</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-[#D4A017] font-bold">{order.order_number}</p>
            <p className="text-white font-bold">${order.total?.toLocaleString("es-CO")}</p>
          </div>
          <div className="mt-3 pt-3 border-t border-[#2E3038]">
            {(order as any).payment_status === "paid" ? (
              <span className="inline-flex items-center gap-1.5 bg-green-900/30 text-green-400 text-xs font-semibold px-3 py-1 rounded-full border border-green-800/40">
                <CheckCircle size={12} /> Pago aprobado
              </span>
            ) : (order as any).payment_status === "failed" ? (
              <span className="inline-flex items-center gap-1.5 bg-red-900/20 text-red-400 text-xs font-semibold px-3 py-1 rounded-full border border-red-800/40">
                ✕ Pago rechazado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-[#22242C] text-[#9CA3AF] text-xs font-medium px-3 py-1 rounded-full border border-[#2E3038]">
                <Clock size={11} /> Pago pendiente
              </span>
            )}
          </div>
        </div>

        {/* Status steps */}
        <div className="bg-[#1A1B21] rounded-2xl p-5 border border-[#2E3038]">
          <h3 className="text-white font-bold text-sm mb-4">Estado del pedido</h3>
          <div className="space-y-3">
            {STATUS_STEPS.map((step) => {
              const stepIndex  = STATUS_ORDER.indexOf(step.key);
              const isDone     = currentStep >= stepIndex;
              const isActive   = currentStep === stepIndex;
              const isCancelled = order.status === "cancelled";
              return (
                <div
                  key={step.key}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isActive && !isCancelled ? "bg-[#2A2414] border border-[#D4A017]/30" : "bg-[#22242C]"
                  }`}
                >
                  <div className={`shrink-0 rounded-full p-2 ${
                    isDone && !isCancelled ? "bg-[#D4A017] text-[#0F1117]" : "bg-[#2E3038] text-[#6B7280]"
                  }`}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${isDone && !isCancelled ? "text-white" : "text-[#6B7280]"}`}>
                      {step.label}
                      {isActive && !isCancelled && (
                        <span className="ml-2 text-[#D4A017] text-xs animate-pulse">● Ahora</span>
                      )}
                    </p>
                    <p className="text-[#6B7280] text-xs">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {order.status === "cancelled" && (
            <div className="mt-3 bg-red-900/20 border border-red-800/40 rounded-xl p-3 text-center">
              <p className="text-red-400 text-sm font-medium">Pedido cancelado</p>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="bg-[#1A1B21] rounded-2xl p-5 border border-[#2E3038]">
          <h3 className="text-white font-bold text-sm mb-3">Productos</h3>
          <div className="space-y-2">
            {(order.items as any[])?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-[#9CA3AF]">{item.menu_item_name} <span className="text-[#6B7280]">x{item.quantity}</span></span>
                <span className="text-white font-medium">${item.subtotal?.toLocaleString("es-CO")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* New order CTA */}
        <Link
          href="/menu"
          className="block w-full text-center bg-[#1A1B21] border border-[#2E3038] text-[#9CA3AF] hover:text-white hover:border-[#D4A017]/40 font-medium py-3 rounded-2xl text-sm transition-colors"
        >
          + Hacer otro pedido
        </Link>

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
