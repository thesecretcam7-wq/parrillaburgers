"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Order, OrderStatus } from "@/lib/types";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmado" },
  { value: "preparing", label: "Preparando" },
  { value: "on_the_way", label: "En camino" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  preparing: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  on_the_way: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  delivered: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const fetch = async () => {
      const q = supabase.from("orders").select("*").order("created_at", { ascending: false });
      let data;
      if (filter === "all") {
        // Default: hide delivered and cancelled — show only active orders
        ({ data } = await q.neq("status", "delivered").neq("status", "cancelled"));
      } else {
        ({ data } = await q.eq("status", filter));
      }
      setOrders(data ?? []);
      setLoading(false);
    };
    fetch();

    // Realtime
    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, fetch)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [filter]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const supabase = createClient();
    const { error } = await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", orderId);
    if (error) { console.error("Error updating order:", error); return; }
    // Update local state immediately (don't wait for Realtime)
    if (status === "delivered" || status === "cancelled") {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setExpanded(null);
    } else {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-black text-[#F5F0E8] mb-8">Pedidos</h1>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${filter === "all" ? "bg-[#D4A017] text-[#111217] border-[#D4A017]" : "border-[#2E3038] text-[#CCCCCC] hover:border-[#D4A017]"}`}
        >
          Activos
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${filter === s.value ? "bg-[#D4A017] text-[#111217] border-[#D4A017]" : "border-[#2E3038] text-[#CCCCCC] hover:border-[#D4A017]"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-[#888899] text-center py-12">Cargando pedidos...</p>
      ) : orders.length === 0 ? (
        <p className="text-[#888899] text-center py-12">No hay pedidos</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-[#22232B] border border-[#2E3038] rounded-xl overflow-hidden">
              {/* Header row */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#1A1B21] transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-4">
                  <span className="text-[#D4A017] font-mono font-bold text-sm">{order.order_number}</span>
                  <span className="text-[#CCCCCC] text-sm">{order.customer_name}</span>
                  <span className="text-[#888899] text-xs">{order.customer_phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[order.status]}`}>
                    {STATUS_OPTIONS.find((s) => s.value === order.status)?.label}
                  </span>
                  <span className="text-[#F5F0E8] font-bold text-sm">${order.total?.toLocaleString("es-CO")}</span>
                </div>
              </div>

              {/* Expanded */}
              {expanded === order.id && (
                <div className="border-t border-[#2E3038] p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[#888899] text-xs mb-1">Dirección</p>
                      <p className="text-[#CCCCCC]">{order.delivery_address}</p>
                    </div>
                    <div>
                      <p className="text-[#888899] text-xs mb-1">Email</p>
                      <p className="text-[#CCCCCC]">{order.customer_email}</p>
                    </div>
                    {order.notes && (
                      <div className="col-span-2">
                        <p className="text-[#888899] text-xs mb-1">Notas</p>
                        <p className="text-[#CCCCCC]">{order.notes}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-[#888899] text-xs mb-2">Productos</p>
                    {(order.items as any[])?.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm text-[#CCCCCC] mb-1">
                        <span>{item.menu_item_name} x{item.quantity}</span>
                        <span>${item.subtotal?.toLocaleString("es-CO")}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="text-[#888899] text-xs mb-2">Actualizar estado</p>
                    <div className="flex gap-2 flex-wrap">
                      {STATUS_OPTIONS.map((s) => (
                        <button
                          key={s.value}
                          onClick={() => updateStatus(order.id, s.value)}
                          disabled={order.status === s.value}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                            order.status === s.value
                              ? "bg-[#D4A017] text-[#111217] border-[#D4A017]"
                              : "border-[#2E3038] text-[#CCCCCC] hover:border-[#D4A017] hover:text-[#D4A017]"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
