"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/store/cart";
import { Order, OrderStatus } from "@/lib/types";
import { CheckCircle, Clock, ChefHat, Bike, Package, ShoppingBag, Timer, Star } from "lucide-react";
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
  const router = useRouter();
  const { clearCart } = useCartStore();
  const params = useSearchParams();
  const urlOrder        = params.get("order");
  const wompiTxId       = params.get("id");
  const [order, setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [deliveryTime, setDeliveryTime] = useState<string | null>(null);
  const prevStatusRef = useRef<string | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSent, setReviewSent] = useState(false);
  const [reviewSending, setReviewSending] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const verifiedRef = useRef(false);

  // Resolve order number: URL param → localStorage fallback
  useEffect(() => {
    // If user came back from Wompi without completing payment, redirect to cart
    if (urlOrder && !wompiTxId && !verifiedRef.current) {
      verifiedRef.current = true;
      // User pressed back in Wompi - redirect to cart to retry
      router.push("/carrito");
      return;
    }

    const resolved = urlOrder ?? localStorage.getItem("pb-last-order");
    setOrderNumber(resolved);
    if (!resolved) setLoading(false);
  }, [urlOrder, wompiTxId]);

  // Fetch delivery time setting
  useEffect(() => {
    createClient()
      .from("settings").select("value").eq("key", "delivery_time").single()
      .then(({ data }) => { if (data?.value) setDeliveryTime(data.value); });
  }, []);

  // Verify Wompi payment when redirected from Wompi
  useEffect(() => {
    if (!wompiTxId || !urlOrder || verifiedRef.current) return;
    verifiedRef.current = true;
    (async () => {
      try {
        // Retrieve pending order data from localStorage
        let fullOrderData = null;
        try {
          const pendingData = localStorage.getItem("pb-pending-wompi-order");
          if (pendingData) {
            fullOrderData = JSON.parse(pendingData);
            // Clean up the pending order data after retrieving it
            localStorage.removeItem("pb-pending-wompi-order");
          }
        } catch { /* ignore */ }

        const res = await fetch("/api/wompi/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactionId: wompiTxId,
            orderNumber: urlOrder,
            fullOrderData
          }),
        });
        const data = await res.json();
        if (data.status === "APPROVED") {
          clearCart();
          toast.success("¡Pago aprobado! Tu pedido está confirmado 🎉");
          // Wait a moment for the order to be created in Supabase, then force reload
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else if (data.status === "PENDING") {
          toast("Pago en proceso, te notificaremos pronto", { icon: "⏳" });
        } else {
          setPaymentFailed(true);
        }
      } catch { /* silent */ }
    })();
  }, [wompiTxId, urlOrder]);

  // Request notification permission once
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const NOTIFY_MESSAGES: Partial<Record<OrderStatus, { title: string; body: string }>> = {
    confirmed:  { title: "✅ Pedido confirmado",    body: "Tu pedido fue recibido y confirmado." },
    preparing:  { title: "👨‍🍳 Preparando tu pedido", body: "El equipo está cocinando tu pedido." },
    on_the_way: { title: "🛵 ¡Pedido en camino!",   body: "Tu domicilio ya está en ruta." },
    delivered:  { title: "🎉 ¡Pedido entregado!",   body: "Esperamos que lo disfrutes. ¡Buen provecho!" },
    cancelled:  { title: "❌ Pedido cancelado",      body: "Tu pedido fue cancelado. Contáctanos si tienes dudas." },
  };

  const notifyChange = (newStatus: OrderStatus) => {
    const msg = NOTIFY_MESSAGES[newStatus];
    if (!msg || typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification(msg.title, { body: msg.body, icon: "/logo-real.png" });
    }
  };

  // Fetch order + realtime subscription
  useEffect(() => {
    if (!orderNumber) return;
    const supabase = createClient();
    setLoading(true);

    supabase.from("orders").select("*").eq("order_number", orderNumber).single()
      .then(({ data }) => {
        if (data) prevStatusRef.current = data.status;
        setOrder(data);
        setLoading(false);
      });

    const handleUpdate = (newOrder: Order) => {
      if (prevStatusRef.current && newOrder.status !== prevStatusRef.current) {
        notifyChange(newOrder.status as OrderStatus);
        if (newOrder.status === "delivered") setShowReview(true);
      }
      prevStatusRef.current = newOrder.status;
      setOrder(newOrder);
    };

    const channel = supabase
      .channel(`order-${orderNumber}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "orders",
        filter: `order_number=eq.${orderNumber}`,
      }, (payload) => handleUpdate(payload.new as Order))
      .subscribe();

    // Polling fallback: re-fetch every 5s so status updates even if Realtime is not enabled
    const poll = () =>
      supabase.from("orders").select("*").eq("order_number", orderNumber).single()
        .then(({ data }) => { if (data) handleUpdate(data); });
    const interval = setInterval(poll, 5_000);

    return () => { supabase.removeChannel(channel); clearInterval(interval); };
  }, [orderNumber]);

  // When order is delivered or cancelled → clear localStorage so next visit starts fresh
  useEffect(() => {
    if (order?.status === "delivered" || order?.status === "cancelled") {
      localStorage.removeItem("pb-last-order");
    }
  }, [order?.status]);

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

  // ── Delivered ─────────────────────────────────────────────────────────────
  if (order.status === "delivered") {
    const submitReview = async () => {
      if (reviewRating === 0) return;
      setReviewSending(true);
      await createClient().from("reviews").insert({
        order_id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        rating: reviewRating,
        comment: reviewComment.trim() || null,
      });
      setReviewSending(false);
      setReviewSent(true);
    };

    return (
      <main className="min-h-screen bg-[#0F1117] flex flex-col items-center justify-center px-4 pb-24">
        <div className="text-6xl mb-4">🎉</div>
        <p className="text-white font-black text-2xl mb-1 text-center">¡Pedido entregado!</p>
        <p className="text-[#9CA3AF] text-sm mb-2 text-center">Esperamos que lo hayas disfrutado 🍔</p>
        <p className="text-[#6B7280] text-xs mb-6">{order.order_number}</p>

        {/* Review form — solo si el pedido se marcó entregado mientras el cliente estaba en pantalla */}
        {showReview && (
          !reviewSent ? (
            <div className="w-full max-w-xs bg-[#1A1B21] border border-[#2E3038] rounded-2xl p-5 mb-6 space-y-4">
              <p className="text-white font-semibold text-sm text-center">¿Cómo fue tu experiencia?</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setReviewRating(s)}>
                    <Star
                      size={32}
                      className={`transition-all ${s <= reviewRating ? "text-[#D4A017] fill-[#D4A017] scale-110" : "text-[#2E3038]"}`}
                    />
                  </button>
                ))}
              </div>
              {reviewRating > 0 && (
                <textarea
                  className="w-full bg-[#22242C] border border-[#2E3038] rounded-xl px-3 py-2.5 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#D4A017] text-sm resize-none h-20 transition-colors"
                  placeholder="Cuéntanos más (opcional)..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              )}
              <button
                onClick={submitReview}
                disabled={reviewRating === 0 || reviewSending}
                className="w-full bg-[#D4A017] disabled:opacity-40 text-[#0F1117] font-bold py-3 rounded-xl text-sm transition-opacity"
              >
                {reviewSending ? "Enviando..." : "Enviar reseña"}
              </button>
            </div>
          ) : (
            <div className="w-full max-w-xs bg-green-900/20 border border-green-800/30 rounded-2xl p-4 mb-6 text-center">
              <p className="text-green-400 font-semibold text-sm">¡Gracias por tu reseña! 🙏</p>
            </div>
          )
        )}

        <Link href="/menu" className="bg-[#D4A017] text-[#0F1117] font-bold px-8 py-4 rounded-xl text-base">
          Hacer otro pedido
        </Link>
      </main>
    );
  }


  // ── Payment failed (Wompi declined while user was in checkout) ────────────
  if (paymentFailed) {
    return (
      <main className="min-h-screen bg-[#0F1117] flex flex-col items-center justify-center px-4 pb-24">
        <div className="text-5xl mb-4">💳</div>
        <p className="text-white font-bold text-xl mb-2">Pago rechazado</p>
        <p className="text-[#9CA3AF] text-sm mb-1 text-center">
          Tu pago no fue aprobado. <strong>No se realizó ningún cobro.</strong>
        </p>
        <p className="text-[#6B7280] text-xs mb-8 text-center">
          Verifica los datos de tu tarjeta e intenta de nuevo desde el menú.
        </p>
        <Link
          href="/menu"
          className="bg-[#D4A017] text-[#0F1117] font-bold px-8 py-4 rounded-xl text-base"
        >
          Volver al menú
        </Link>
      </main>
    );
  }

  // ── Cancelled ─────────────────────────────────────────────────────────────
  if (order.status === "cancelled") {
    return (
      <main className="min-h-screen bg-[#0F1117] flex flex-col items-center justify-center px-4 pb-24">
        <div className="text-5xl mb-4">😞</div>
        <p className="text-white font-bold text-xl mb-1">Pedido cancelado</p>
        <p className="text-[#9CA3AF] text-sm mb-8 text-center">
          Si tienes dudas contáctanos.
        </p>
        <Link
          href="/menu"
          className="bg-[#D4A017] text-[#0F1117] font-bold px-8 py-4 rounded-xl text-base"
        >
          Hacer nuevo pedido
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
            {order.wompi_transaction_id === "CONTRA_ENTREGA" ? (
              <span className="inline-flex items-center gap-1.5 bg-green-900/20 text-green-400 text-xs font-semibold px-3 py-1 rounded-full border border-green-800/30">
                💵 Pagas al recibir
              </span>
            ) : order.payment_status === "paid" ? (
              <span className="inline-flex items-center gap-1.5 bg-green-900/30 text-green-400 text-xs font-semibold px-3 py-1 rounded-full border border-green-800/40">
                <CheckCircle size={12} /> Pago aprobado
              </span>
            ) : order.payment_status === "failed" ? (
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

        {/* Tiempo estimado — solo en pedidos activos */}
        {deliveryTime && (
          <div className="bg-[#2A2414] border border-[#D4A017]/20 rounded-2xl px-5 py-3 flex items-center gap-3">
            <Timer size={18} className="text-[#D4A017] shrink-0" />
            <div>
              <p className="text-[#E8B830] text-sm font-semibold">Tiempo estimado de entrega</p>
              <p className="text-[#D4A017]/70 text-xs">~{deliveryTime} minutos desde la confirmación</p>
            </div>
          </div>
        )}

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
