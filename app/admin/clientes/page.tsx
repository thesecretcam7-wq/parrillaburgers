import { createClient } from "@/lib/supabase/server";
import { Customer } from "@/lib/types";
import { Users, Star, ShoppingBag, TrendingUp } from "lucide-react";

export const revalidate = 30;

export default async function AdminClientesPage() {
  const supabase = await createClient();

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .order("total_spent", { ascending: false });

  const list: Customer[] = customers ?? [];

  const totalPoints = list.reduce((s, c) => s + (c.points ?? 0), 0);
  const totalSpent = list.reduce((s, c) => s + (Number(c.total_spent) ?? 0), 0);
  const totalOrders = list.reduce((s, c) => s + (c.total_orders ?? 0), 0);

  const getLevelBadge = (points: number) => {
    if (points >= 500) return { label: "Oro", color: "bg-yellow-500/20 text-yellow-400" };
    if (points >= 200) return { label: "Plata", color: "bg-slate-400/20 text-slate-300" };
    return { label: "Bronce", color: "bg-orange-700/20 text-orange-400" };
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#F5F0E8]">Clientes</h1>
        <p className="text-[#888899] text-sm mt-1">{list.length} clientes registrados</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total clientes", value: list.length, icon: <Users size={18} />, color: "text-blue-400" },
          { label: "Puntos entregados", value: totalPoints.toLocaleString("es-CO"), icon: <Star size={18} />, color: "text-[#D4A017]" },
          { label: "Pedidos totales", value: totalOrders, icon: <ShoppingBag size={18} />, color: "text-green-400" },
          { label: "Facturación total", value: `$${totalSpent.toLocaleString("es-CO")}`, icon: <TrendingUp size={18} />, color: "text-purple-400" },
        ].map((s) => (
          <div key={s.label} className="bg-[#1A1B21] border border-[#2E3038] rounded-xl p-5">
            <div className={`${s.color} mb-3`}>{s.icon}</div>
            <p className="text-[#F5F0E8] font-bold text-xl">{s.value}</p>
            <p className="text-[#888899] text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#1A1B21] border border-[#2E3038] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2E3038]">
              <th className="text-left px-5 py-3.5 text-[#888899] font-semibold">Cliente</th>
              <th className="text-left px-5 py-3.5 text-[#888899] font-semibold hidden md:table-cell">Teléfono</th>
              <th className="text-center px-5 py-3.5 text-[#888899] font-semibold">Nivel</th>
              <th className="text-center px-5 py-3.5 text-[#888899] font-semibold">Puntos</th>
              <th className="text-center px-5 py-3.5 text-[#888899] font-semibold hidden lg:table-cell">Pedidos</th>
              <th className="text-right px-5 py-3.5 text-[#888899] font-semibold">Total gastado</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => {
              const badge = getLevelBadge(c.points ?? 0);
              return (
                <tr key={c.id} className="border-b border-[#2E3038] last:border-0 hover:bg-[#22232B] transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-[#F5F0E8] font-semibold">{c.name}</p>
                    <p className="text-[#888899] text-xs mt-0.5">{c.email}</p>
                  </td>
                  <td className="px-5 py-4 text-[#CCCCCC] hidden md:table-cell">{c.phone ?? "—"}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${badge.color}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-[#D4A017] font-bold">{(c.points ?? 0).toLocaleString()}</span>
                  </td>
                  <td className="px-5 py-4 text-center text-[#CCCCCC] hidden lg:table-cell">{c.total_orders ?? 0}</td>
                  <td className="px-5 py-4 text-right text-[#F5F0E8] font-mono">
                    ${Number(c.total_spent ?? 0).toLocaleString("es-CO")}
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-16 text-[#888899]">
                  No hay clientes registrados aún
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
