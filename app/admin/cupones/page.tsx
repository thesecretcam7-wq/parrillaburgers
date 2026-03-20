"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Coupon } from "@/lib/types";
import { Plus, Trash2, X, Tag, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  code: "",
  type: "percent" as "percent" | "fixed",
  value: "",
  min_order: "0",
  max_uses: "",
  expires_at: "",
};

export default function CuponesPage() {
  const supabase = createClient();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons((data as Coupon[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSave = async () => {
    if (!form.code.trim() || !form.value) {
      toast.error("Código y valor son obligatorios");
      return;
    }
    setSaving(true);
    const payload = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: parseFloat(form.value),
      min_order: parseFloat(form.min_order) || 0,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      expires_at: form.expires_at || null,
      active: true,
      uses_count: 0,
    };
    const { error } = await supabase.from("coupons").insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message.includes("unique") ? "Ya existe un cupón con ese código" : `Error: ${error.message}`);
    } else {
      toast.success("Cupón creado");
      setModalOpen(false);
      setForm(EMPTY_FORM);
      fetchCoupons();
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    await supabase.from("coupons").update({ active: !coupon.active }).eq("id", coupon.id);
    setCoupons((prev) => prev.map((c) => c.id === coupon.id ? { ...c, active: !c.active } : c));
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`¿Eliminar cupón "${code}"?`)) return;
    await supabase.from("coupons").delete().eq("id", id);
    toast.success("Cupón eliminado");
    fetchCoupons();
  };

  const inputCls = "w-full bg-[#111217] border border-[#2E3038] rounded-lg px-3 py-2.5 text-[#F5F0E8] placeholder-[#555566] focus:outline-none focus:border-[#D4A017] text-sm transition-colors";

  const isExpired = (c: Coupon) => !!c.expires_at && new Date(c.expires_at) < new Date();
  const isFull = (c: Coupon) => c.max_uses !== null && c.uses_count >= c.max_uses;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#F5F0E8]">Cupones de descuento</h1>
          <p className="text-[#888899] text-sm mt-1">{coupons.filter((c) => c.active).length} activos · {coupons.length} total</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#D4A017] hover:bg-[#E8B830] text-[#111217] rounded-lg transition-colors text-sm font-bold"
        >
          <Plus size={16} /> Nuevo cupón
        </button>
      </div>

      {loading ? (
        <p className="text-[#888899] text-center py-12">Cargando...</p>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 text-[#555566]">
          <Tag size={40} className="mx-auto mb-3 opacity-40" />
          <p>No hay cupones creados</p>
        </div>
      ) : (
        <div className="bg-[#1A1B21] border border-[#2E3038] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2E3038]">
                <th className="text-left px-4 py-3.5 text-[#888899] font-semibold">Código</th>
                <th className="text-left px-4 py-3.5 text-[#888899] font-semibold">Descuento</th>
                <th className="text-left px-4 py-3.5 text-[#888899] font-semibold hidden sm:table-cell">Usos</th>
                <th className="text-left px-4 py-3.5 text-[#888899] font-semibold hidden sm:table-cell">Vence</th>
                <th className="text-center px-4 py-3.5 text-[#888899] font-semibold">Estado</th>
                <th className="text-right px-4 py-3.5 text-[#888899] font-semibold">Acc.</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-[#2E3038] last:border-0 hover:bg-[#22232B] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-[#D4A017] shrink-0" />
                      <span className="text-[#F5F0E8] font-mono font-bold">{c.code}</span>
                    </div>
                    {c.min_order > 0 && (
                      <p className="text-[#555566] text-xs mt-0.5 ml-5">Mín. ${c.min_order.toLocaleString("es-CO")}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-[#D4A017]/10 text-[#D4A017] px-2.5 py-1 rounded-full text-xs font-bold">
                      {c.type === "percent" ? `${c.value}%` : `-$${c.value.toLocaleString("es-CO")}`}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-[#CCCCCC]">
                    {c.uses_count}{c.max_uses !== null ? ` / ${c.max_uses}` : ""}
                    {isFull(c) && <span className="ml-2 text-red-400 text-xs">Agotado</span>}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-[#CCCCCC]">
                    {c.expires_at
                      ? <span className={isExpired(c) ? "text-red-400" : ""}>{new Date(c.expires_at).toLocaleDateString("es-CO")}</span>
                      : <span className="text-[#555566]">Sin fecha</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleActive(c)}>
                      {c.active && !isExpired(c) && !isFull(c)
                        ? <ToggleRight size={22} className="text-green-400 mx-auto" />
                        : <ToggleLeft size={22} className="text-[#555566] mx-auto" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(c.id, c.code)}
                      className="p-2 text-[#888899] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50">
          <div className="absolute inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-full p-4">
          <div className="bg-[#1A1B21] border border-[#2E3038] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#2E3038]">
              <h2 className="text-[#F5F0E8] font-bold text-lg">Nuevo cupón</h2>
              <button onClick={() => setModalOpen(false)} className="text-[#888899] hover:text-[#F5F0E8]"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[#CCCCCC] text-xs mb-1.5 block">Código *</label>
                <input className={`${inputCls} uppercase`} placeholder="Ej: PROMO20" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#CCCCCC] text-xs mb-1.5 block">Tipo *</label>
                  <select className={`${inputCls} appearance-none`} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "percent" | "fixed" })}>
                    <option value="percent">Porcentaje (%)</option>
                    <option value="fixed">Monto fijo ($)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#CCCCCC] text-xs mb-1.5 block">
                    {form.type === "percent" ? "Porcentaje (1-100) *" : "Monto COP *"}
                  </label>
                  <input className={inputCls} type="number" min="1" placeholder={form.type === "percent" ? "20" : "5000"} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#CCCCCC] text-xs mb-1.5 block">Pedido mínimo (COP)</label>
                  <input className={inputCls} type="number" min="0" placeholder="0" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: e.target.value })} />
                </div>
                <div>
                  <label className="text-[#CCCCCC] text-xs mb-1.5 block">Usos máximos</label>
                  <input className={inputCls} type="number" min="1" placeholder="Sin límite" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-[#CCCCCC] text-xs mb-1.5 block">Fecha de vencimiento</label>
                <input className={inputCls} type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-[#2E3038]">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-[#2E3038] text-[#CCCCCC] rounded-lg hover:border-[#888899] transition-colors text-sm">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-[#D4A017] hover:bg-[#E8B830] disabled:opacity-50 text-[#111217] font-bold rounded-lg transition-colors text-sm">
                {saving ? "Creando..." : "Crear cupón"}
              </button>
            </div>
          </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
