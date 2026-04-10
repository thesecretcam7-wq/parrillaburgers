"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Order, OrderStatus, OrderItem } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardList, Clock, RotateCcw, X, MapPin, StickyNote, ChevronRight } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import toast from "react-hot-toast";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending:    "Pendiente",
  confirmed:  "Confirmado",
  preparing:  "Preparando",
  on_the_way: "En camino",
  delivered:  "Entregado",
  cancelled:  "Cancelado",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending:    "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  confirmed:  "bg-blue-500/15 text-blue-400 border-blue-500/25",
  preparing:  "bg-orange-500/15 text-orange-400 border-orange-500/25",
  on_the_way: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  delivered:  "bg-green-500/15 text-green-400 border-green-500/25",
  cancelled:  "bg-red-500/15 text-red-400 border-red-500/25",
};

const ACTIVE_STATUSES: OrderStatus[] = ["pending", "confirmed", "preparing", "on_the_way"];

export default function MisPedidosPage() {
  const [orders, setOrders]             = useState<Order[]>([]);
  const [loading, setLoading]           = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [noAccount, setNoAccount]       = useState(false);
  const [selected, setSelected]         = useState<Order | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("pb-customer");
    if (!saved) { setNoAccount(true); setLoading(false); return; }

    const { email, name } = JSON.parse(saved) as { email?: string; name?: string };
    if (!email) { setNoAccount(true); setLoading(false); return; }

    setCustomerName(name ?? "");

    createClient()
      .from("orders")
      .select("*")
      .eq("customer_email", email)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders(data ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0F1117] flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (noAccount) {
    return (
      <main className="min-h-screen bg-[#0F1117] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[#1C1800] flex items-center justify-center mb-4">
          <ClipboardList size={38} className="text-[#6B7280]" />
        </div>
        <h2 className="text-white font-bold text-lg mb-2">Aún no tienes pedidos</h2>
        <p className="text-[#6B7280] text-sm mb-8">Cuando hagas tu primer pedido aparecerá aquí</p>
        <Link href="/menu" className="bg-[#D4A017] text-[#0F1117] font-bold px-8 py-3 rounded-xl">
          Ver Menú
        </Link>
      </main>
    );
  }

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status as OrderStatus));
  const pastOrders   = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status as OrderStatus));

  return (
    <main className="min-h-screen bg-[#0F1117] px-4 py-4 pb-28">
      <div className="max-w-lg mx-auto">

        {customerName && (
          <p className="text-[#888899] text-sm mb-6">
            Pedidos de <span className="text-[#F5F0E8] font-semibold">{customerName}</span>
          </p>
        )}

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-[#1C1800] flex items-center justify-center mb-4">
              <ClipboardList size={38} className="text-[#6B7280]" />
            </div>
            <h2 className="text-white font-bold text-lg mb-2">Aún no tienes pedidos</h2>
            <p className="text-[#6B7280] text-sm mb-8">Cuando hagas tu primer pedido aparecerá aquí</p>
            <Link href="/menu" className="bg-[#D4A017] text-[#0F1117] font-bold px-8 py-3 rounded-xl">
              Ver Menú
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {activeOrders.length > 0 && (
              <section>
                <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4A017] animate-pulse" />
                  En curso
                </h2>
                <div className="space-y-2">
                  {activeOrders.map((o) => (
                    <OrderCard key={o.id} order={o} onOpen={() => setSelected(o)} />
                  ))}
                </div>
              </section>
            )}

            {pastOrders.length > 0 && (
              <section>
                <h2 className="text-[#888899] font-semibold text-sm mb-3 flex items-center gap-2">
                  <Clock size={14} />
                  Historial
                </h2>
                <div className="space-y-2">
                  {pastOrders.map((o) => (
                    <OrderCard key={o.id} order={o} onOpen={() => setSelected(o)} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {selected && (
        <OrderDetailModal order={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  );
}

/* ─── Tarjeta ─── */
function OrderCard({ order, onOpen }: { order: Order; onOpen: () => void }) {
  const isActive  = ACTIVE_STATUSES.includes(order.status as OrderStatus);
  const itemCount = (order.items as OrderItem[])?.length ?? 0;
  const date      = new Date(order.created_at).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  });

  return (
    <button
      onClick={onOpen}
      className={`w-full flex items-center gap-4 bg-[#16130A] rounded-2xl p-4 border transition-colors active:scale-[0.99] text-left ${
        isActive
          ? "border-[#D4A017]/30 hover:border-[#D4A017]/60"
          : "border-[#2A2210] hover:border-[#D4A017]/30"
      }`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
        isActive ? "bg-[#D4A017]/15" : "bg-[#1C1800]"
      }`}>
        <span className="text-xl">🍔</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[#D4A017] font-mono font-bold text-xs">{order.order_number}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_COLOR[order.status as OrderStatus]}`}>
            {STATUS_LABEL[order.status as OrderStatus]}
          </span>
        </div>
        <p className="text-white font-semibold text-sm truncate">
          {itemCount} {itemCount === 1 ? "producto" : "productos"}
        </p>
        <p className="text-[#6B7280] text-xs mt-0.5">{date}</p>
      </div>

      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <p className="text-[#F5F0E8] font-bold text-sm">${order.total?.toLocaleString("es-CO")}</p>
        <ChevronRight size={16} className="text-[#6B7280]" />
      </div>
    </button>
  );
}

/* ─── Modal detalle ─── */
function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const router   = useRouter();
  const addItem  = useCartStore((s) => s.addItem);
  const isActive = ACTIVE_STATUSES.includes(order.status as OrderStatus);
  const items    = order.items as OrderItem[];

  const date = new Date(order.created_at).toLocaleDateString("es-CO", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  function repeatOrder() {
    items.forEach((oi) => {
      addItem({
        id: oi.menu_item_id,
        name: oi.menu_item_name,
        price: oi.unit_price,
        category_id: "",
        description: null,
        image_url: null,
        available: true,
        sort_order: 0,
        created_at: "",
        barra_libre_items: null,
      }, oi.barra_libre_selected);
    });
    toast.success("Pedido agregado al carrito");
    onClose();
    router.push("/carrito");
  }

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 flex items-end sm:items-center justify-center"
      onClick={handleBackdrop}
    >
      <div className="bg-[#16130A] w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden max-h-[90dvh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#2A2210]">
          <div>
            <p className="text-[#D4A017] font-mono font-bold text-sm">{order.order_number}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_COLOR[order.status as OrderStatus]}`}>
                {STATUS_LABEL[order.status as OrderStatus]}
              </span>
              <span className="text-[#6B7280] text-xs">{date}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1C1800] border border-[#2A2210] flex items-center justify-center text-[#888899] hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Cuerpo scrolleable */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">

          {/* Productos */}
          <div>
            <p className="text-[#888899] text-xs font-semibold uppercase tracking-wide mb-3">Productos</p>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="bg-[#1C1800] rounded-xl p-3">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">{item.menu_item_name}</p>
                      {item.barra_libre_selected && item.barra_libre_selected.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {item.barra_libre_selected.map((opt, j) => (
                            <span key={j} className="px-2 py-0.5 rounded-full text-[10px] bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/20">
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[#888899] text-xs">x{item.quantity}</p>
                      <p className="text-[#F5F0E8] font-semibold text-sm">${item.subtotal?.toLocaleString("es-CO")}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dirección o Mesa */}
          {order.delivery_address && (
            <div className="flex items-start gap-2">
              <MapPin size={14} className="text-[#6B7280] mt-0.5 shrink-0" />
              <p className="text-[#888899] text-sm">{order.delivery_address}</p>
            </div>
          )}

          {/* Notas */}
          {order.notes && (
            <div className="flex items-start gap-2 bg-[#1C1800] rounded-xl p-3">
              <StickyNote size={14} className="text-[#D4A017] mt-0.5 shrink-0" />
              <p className="text-[#CCCCCC] text-sm">{order.notes}</p>
            </div>
          )}

          {/* Totales */}
          <div className="border-t border-[#2A2210] pt-4 space-y-1.5">
            <div className="flex justify-between text-sm text-[#888899]">
              <span>Subtotal</span>
              <span>${order.subtotal?.toLocaleString("es-CO")}</span>
            </div>
            {order.delivery_fee > 0 && (
              <div className="flex justify-between text-sm text-[#888899]">
                <span>Domicilio</span>
                <span>${order.delivery_fee?.toLocaleString("es-CO")}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-white text-base pt-1">
              <span>Total</span>
              <span>${order.total?.toLocaleString("es-CO")}</span>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="px-5 py-4 border-t border-[#2A2210] flex gap-3">
          {isActive ? (
            <Link
              href={`/seguimiento?order=${order.order_number}`}
              className="flex-1 bg-[#D4A017] text-[#0F1117] font-bold py-3 rounded-xl text-sm text-center"
              onClick={onClose}
            >
              Ver seguimiento
            </Link>
          ) : (
            <button
              onClick={repeatOrder}
              className="flex-1 flex items-center justify-center gap-2 bg-[#D4A017] text-[#0F1117] font-bold py-3 rounded-xl text-sm"
            >
              <RotateCcw size={15} />
              Repetir pedido
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
