"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Order } from "@/lib/types";
import { TrendingUp, ShoppingBag, Users, CreditCard, Download } from "lucide-react";

type Period = "today" | "week" | "month" | "all";

const PERIOD_LABELS: Record<Period, string> = {
  today: "Hoy",
  week:  "Esta semana",
  month: "Este mes",
  all:   "Todo el tiempo",
};

const STATUS_LABEL: Record<string, string> = {
  pending:    "Pendiente",
  confirmed:  "Confirmado",
  preparing:  "Preparando",
  on_the_way: "En camino",
  delivered:  "Entregado",
  cancelled:  "Cancelado",
};

const STATUS_COLOR: Record<string, string> = {
  pending:    "bg-yellow-500",
  confirmed:  "bg-blue-500",
  preparing:  "bg-orange-500",
  on_the_way: "bg-purple-500",
  delivered:  "bg-green-500",
  cancelled:  "bg-red-500",
};

function startOf(period: Period): Date {
  const now = new Date();
  if (period === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (period === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - 6);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (period === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return new Date(0);
}

export default function ReportesPage() {
  const [all, setAll]       = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("month");

  useEffect(() => {
    createClient()
      .from("orders")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data }) => { setAll(data ?? []); setLoading(false); });
  }, []);

  const orders = useMemo(() => {
    if (period === "all") return all;
    const start = startOf(period);
    return all.filter((o) => new Date(o.created_at) >= start);
  }, [all, period]);

  // Contraentrega/Pagar en caja = sin wompi → se cuenta cuando está entregado
  const isCash = (o: Order) =>
    !o.wompi_transaction_id || o.wompi_transaction_id === "PAGAR_EN_CAJA";

  const paid = orders.filter(
    (o) =>
      o.status !== "cancelled" &&
      (o.payment_status === "paid" ||            // Wompi pagado
        (isCash(o) && o.status === "delivered")) // Contraentrega/caja entregada
  );

  const revenue      = paid.reduce((s, o) => s + (o.total ?? 0), 0);
  const avgTicket    = paid.length ? revenue / paid.length : 0;
  const uniqueEmails = new Set(orders.map((o) => o.customer_email)).size;

  // Top productos desde JSONB items
  const productMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  paid.forEach((order) => {
    (order.items as any[])?.forEach((item) => {
      const key = item.menu_item_name;
      if (!productMap[key]) productMap[key] = { name: key, qty: 0, revenue: 0 };
      productMap[key].qty     += item.quantity ?? 1;
      productMap[key].revenue += item.subtotal ?? 0;
    });
  });
  const topProducts = Object.values(productMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 8);
  const maxQty = topProducts[0]?.qty || 1;

  // Distribución por estado (solo pedidos del período, excluir pending sin pago)
  const byStatus: Record<string, number> = {};
  orders.forEach((o) => { byStatus[o.status] = (byStatus[o.status] ?? 0) + 1; });
  const totalOrders = orders.length;

  // Ventas por día (últimos 7 días o mes)
  const dailyMap: Record<string, number> = {};
  const days = period === "today" ? 1 : period === "week" ? 7 : period === "month" ? 30 : 30;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailyMap[key] = 0;
  }
  paid.forEach((o) => {
    const key = o.created_at.slice(0, 10);
    if (key in dailyMap) dailyMap[key] += o.total ?? 0;
  });
  const dailyEntries = Object.entries(dailyMap);
  const maxDaily = Math.max(...dailyEntries.map(([, v]) => v), 1);

  function exportCSV() {
    const rows = [
      ["Número", "Fecha", "Cliente", "Email", "Teléfono", "Dirección", "Estado", "Pago", "Total"],
      ...orders.map((o) => [
        o.order_number,
        new Date(o.created_at).toLocaleString("es-CO"),
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        o.delivery_address,
        o.status,
        o.payment_status,
        String(o.total ?? 0),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pedidos_${PERIOD_LABELS[period].replace(/ /g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header + period selector */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-[#F5F0E8]">Reportes</h1>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-[#2E3038] text-[#CCCCCC] hover:border-[#D4A017] hover:text-[#D4A017] transition-colors"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Exportar CSV</span>
            <span className="sm:hidden">CSV</span>
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                period === p
                  ? "bg-[#D4A017] text-[#111217] border-[#D4A017]"
                  : "border-[#2E3038] text-[#CCCCCC] hover:border-[#D4A017]"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Ingresos",       value: `$${revenue.toLocaleString("es-CO")}`,     icon: TrendingUp,  color: "text-[#D4A017]" },
          { label: "Pedidos pagados",value: paid.length,                               icon: ShoppingBag, color: "text-blue-400" },
          { label: "Ticket promedio",value: `$${Math.round(avgTicket).toLocaleString("es-CO")}`, icon: CreditCard, color: "text-green-400" },
          { label: "Clientes únicos",value: uniqueEmails,                              icon: Users,       color: "text-purple-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#22232B] border border-[#2E3038] rounded-xl p-5">
            <div className={`mb-3 ${color}`}><Icon size={20} /></div>
            <p className="text-[#888899] text-xs">{label}</p>
            <p className="text-[#F5F0E8] font-black text-2xl mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Ventas por día */}
        {dailyEntries.length > 1 && (
          <div className="bg-[#22232B] border border-[#2E3038] rounded-xl p-6">
            <h2 className="text-[#F5F0E8] font-bold mb-5">Ventas diarias</h2>
            <div className="flex items-end gap-1 h-32">
              {dailyEntries.map(([date, val]) => {
                const pct = maxDaily > 0 ? (val / maxDaily) * 100 : 0;
                const label = new Date(date + "T12:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short" });
                return (
                  <div key={date} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="w-full flex flex-col justify-end" style={{ height: "100px" }}>
                      <div
                        className="w-full bg-[#D4A017] rounded-t-sm transition-all duration-300 min-h-[2px]"
                        style={{ height: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                    {/* Tooltip */}
                    {val > 0 && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#111217] border border-[#2E3038] text-[#F5F0E8] text-[10px] font-medium px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        ${val.toLocaleString("es-CO")}
                      </div>
                    )}
                    {dailyEntries.length <= 14 && (
                      <span className="text-[#888899] text-[8px] leading-tight text-center">{label}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top productos */}
        <div className="bg-[#22232B] border border-[#2E3038] rounded-xl p-6">
          <h2 className="text-[#F5F0E8] font-bold mb-5">Productos más vendidos</h2>
          {topProducts.length === 0 ? (
            <p className="text-[#888899] text-sm text-center py-8">Sin datos en este período</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[#888899] text-xs w-4">{i + 1}</span>
                      <span className="text-[#CCCCCC] text-sm truncate max-w-[160px]">{p.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#D4A017] font-bold text-sm">{p.qty}</span>
                      <span className="text-[#888899] text-xs ml-1">uds</span>
                    </div>
                  </div>
                  <div className="w-full bg-[#1A1B21] rounded-full h-1.5">
                    <div
                      className="bg-[#D4A017] h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${(p.qty / maxQty) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Distribución por estado */}
      {totalOrders > 0 && (
        <div className="bg-[#22232B] border border-[#2E3038] rounded-xl p-6">
          <h2 className="text-[#F5F0E8] font-bold mb-5">Distribución por estado</h2>
          <div className="space-y-3">
            {Object.entries(byStatus)
              .sort(([, a], [, b]) => b - a)
              .map(([status, count]) => {
                const pct = Math.round((count / totalOrders) * 100);
                return (
                  <div key={status} className="flex items-center gap-3">
                    <span className="text-[#888899] text-xs w-24 shrink-0">{STATUS_LABEL[status] ?? status}</span>
                    <div className="flex-1 bg-[#1A1B21] rounded-full h-2">
                      <div
                        className={`${STATUS_COLOR[status] ?? "bg-gray-500"} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[#CCCCCC] text-xs font-semibold w-8 text-right">{count}</span>
                    <span className="text-[#888899] text-xs w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

    </div>
  );
}
