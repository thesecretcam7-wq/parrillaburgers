"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Order, OrderStatus } from "@/lib/types";
import Link from "next/link";
import { ClipboardList, ChevronRight, Clock, RotateCcw } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { OrderItem } from "@/lib/types";
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
  const [orders, setOrders]     = useState<Order[]>([]);
  const [loading, setLoading]   = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [noAccount, setNoAccount] = useState(false);

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
        <div className="w-20 h-20 rounded-full bg-[#22242C] flex items-center justify-center mb-4">
          <ClipboardList size={38} className="text-[#6B7280]" />
        </div>
        <h2 className="text-white font-bold text-lg mb-2">Aún no tienes pedidos</h2>
        <p className="text-[#6B7280] text-sm mb-8">Cuando hagas tu primer pedido aparecerá aquí</p>
        <Link
          href="/menu"
          className="bg-[#D4A017] text-[#0F1117] font-bold px-8 py-3 rounded-xl"
        >
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
            <div className="w-20 h-20 rounded-full bg-[#22242C] flex items-center justify-center mb-4">
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

            {/* Pedidos activos */}
            {activeOrders.length > 0 && (
              <section>
                <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4A017] animate-pulse" />
                  En curso
                </h2>
                <div className="space-y-2">
                  {activeOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              </section>
            )}

            {/* Historial */}
            {pastOrders.length > 0 && (
              <section>
                <h2 className="text-[#888899] font-semibold text-sm mb-3 flex items-center gap-2">
                  <Clock size={14} />
                  Historial
                </h2>
                <div className="space-y-2">
                  {pastOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </main>
  );
}

function OrderCard({ order }: { order: Order }) {
  const isActive = ACTIVE_STATUSES.includes(order.status as OrderStatus);
  const itemCount = (order.items as OrderItem[])?.length ?? 0;
  const date = new Date(order.created_at).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  });
  const addItem = useCartStore((s) => s.addItem);

  function repeatOrder(e: React.MouseEvent) {
    e.preventDefault();
    const orderItems = order.items as OrderItem[];
    orderItems.forEach((oi) => {
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
  }

  return (
    <Link
      href={`/seguimiento?order=${order.order_number}`}
      className={`flex items-center gap-4 bg-[#1A1B21] rounded-2xl p-4 border transition-colors active:scale-[0.99] ${
        isActive ? "border-[#D4A017]/30 hover:border-[#D4A017]/60" : "border-[#2E3038] hover:border-[#3E4048]"
      }`}
    >
      {/* Icono */}
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
        isActive ? "bg-[#D4A017]/15" : "bg-[#22242C]"
      }`}>
        <span className="text-xl">🍔</span>
      </div>

      {/* Info */}
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

      {/* Repetir + Total */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <p className="text-[#F5F0E8] font-bold text-sm">${order.total?.toLocaleString("es-CO")}</p>
        {!isActive && (
          <button
            onClick={repeatOrder}
            className="flex items-center gap-1 text-[#D4A017] text-[10px] font-semibold hover:text-[#E8B830] transition-colors"
          >
            <RotateCcw size={11} />
            Repetir
          </button>
        )}
        {isActive && <ChevronRight size={16} className="text-[#6B7280]" />}
      </div>
    </Link>
  );
}
