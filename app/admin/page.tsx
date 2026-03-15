import { createClient } from "@/lib/supabase/server";
import { ShoppingBag, Users, TrendingUp, Star } from "lucide-react";

export const revalidate = 30;

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [{ count: totalOrders }, { count: totalCustomers }, { data: recentOrders }] =
    await Promise.all([
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("customers").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5),
    ]);

  const { data: revenue } = await supabase
    .from("orders")
    .select("total")
    .eq("payment_status", "paid");

  const totalRevenue = revenue?.reduce((sum, o) => sum + (o.total ?? 0), 0) ?? 0;

  const stats = [
    { label: "Total Pedidos", value: totalOrders ?? 0, icon: <ShoppingBag size={22} />, color: "text-blue-400" },
    { label: "Clientes", value: totalCustomers ?? 0, icon: <Users size={22} />, color: "text-green-400" },
    { label: "Ingresos", value: `$${totalRevenue.toLocaleString("es-CO")}`, icon: <TrendingUp size={22} />, color: "text-[#D4A017]" },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    confirmed: "bg-blue-500/20 text-blue-400",
    preparing: "bg-orange-500/20 text-orange-400",
    on_the_way: "bg-purple-500/20 text-purple-400",
    delivered: "bg-green-500/20 text-green-400",
    cancelled: "bg-red-500/20 text-red-400",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    preparing: "Preparando",
    on_the_way: "En camino",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };

  return (
    <div>
      <h1 className="text-3xl font-black text-[#F5F0E8] mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {stats.map((s, i) => (
          <div key={i} className="bg-[#22232B] border border-[#2E3038] rounded-xl p-5">
            <div className={`mb-3 ${s.color}`}>{s.icon}</div>
            <p className="text-[#888899] text-sm">{s.label}</p>
            <p className="text-[#F5F0E8] font-black text-3xl mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-[#22232B] border border-[#2E3038] rounded-xl p-6">
        <h2 className="text-[#F5F0E8] font-bold mb-5">Pedidos Recientes</h2>
        {!recentOrders?.length ? (
          <p className="text-[#888899] text-sm text-center py-8">No hay pedidos aún</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2E3038]">
                  {["Pedido", "Cliente", "Total", "Estado", "Fecha"].map((h) => (
                    <th key={h} className="text-left text-[#888899] pb-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-[#2E3038]/50 hover:bg-[#1A1B21] transition-colors">
                    <td className="py-3 text-[#D4A017] font-mono">{order.order_number}</td>
                    <td className="py-3 text-[#CCCCCC]">{order.customer_name}</td>
                    <td className="py-3 text-[#F5F0E8]">${order.total?.toLocaleString("es-CO")}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] ?? ""}`}>
                        {statusLabels[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="py-3 text-[#888899]">
                      {new Date(order.created_at).toLocaleDateString("es-CO")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
