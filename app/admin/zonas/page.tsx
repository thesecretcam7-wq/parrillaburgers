"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, X, MapPin, Pencil } from "lucide-react";
import toast from "react-hot-toast";

type Zona = {
  id: string;
  name: string;
  price: number;
  active: boolean;
  created_at: string;
};

const EMPTY = { name: "", price: "" };

export default function ZonasPage() {
  const supabase = createClient();
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from("delivery_zones").select("*").order("name");
    setZonas((data as Zona[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (z: Zona) => { setEditingId(z.id); setForm({ name: z.name, price: String(z.price) }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) { toast.error("Nombre y precio son obligatorios"); return; }
    setSaving(true);
    const payload = { name: form.name.trim(), price: parseFloat(form.price), active: true };
    const { error } = editingId
      ? await supabase.from("delivery_zones").update(payload).eq("id", editingId)
      : await supabase.from("delivery_zones").insert(payload);
    setSaving(false);
    if (error) { toast.error(`Error: ${error.message}`); return; }
    toast.success(editingId ? "Zona actualizada" : "Zona creada");
    setModalOpen(false);
    fetch();
  };

  const toggleActive = async (z: Zona) => {
    await supabase.from("delivery_zones").update({ active: !z.active }).eq("id", z.id);
    setZonas((prev) => prev.map((x) => x.id === z.id ? { ...x, active: !z.active } : x));
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar zona "${name}"?`)) return;
    await supabase.from("delivery_zones").delete().eq("id", id);
    toast.success("Zona eliminada");
    fetch();
  };

  const inputCls = "w-full bg-[#111217] border border-[#2E3038] rounded-lg px-3 py-2.5 text-[#F5F0E8] placeholder-[#555566] focus:outline-none focus:border-[#D4A017] text-sm transition-colors";

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#F5F0E8]">Zonas de domicilio</h1>
          <p className="text-[#888899] text-sm mt-1">
            {zonas.filter(z => z.active).length} activas · Si no hay zonas, se usa el costo fijo de Configuración
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#D4A017] hover:bg-[#E8B830] text-[#111217] rounded-lg transition-colors text-sm font-bold"
        >
          <Plus size={16} /> Nueva zona
        </button>
      </div>

      {loading ? (
        <p className="text-[#888899] text-center py-12">Cargando...</p>
      ) : zonas.length === 0 ? (
        <div className="text-center py-16 text-[#555566]">
          <MapPin size={40} className="mx-auto mb-3 opacity-40" />
          <p>No hay zonas configuradas</p>
          <p className="text-xs mt-1">Se usará el precio fijo de Configuración</p>
        </div>
      ) : (
        <div className="bg-[#1A1B21] border border-[#2E3038] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2E3038]">
                <th className="text-left px-4 py-3.5 text-[#888899] font-semibold">Zona / Barrio</th>
                <th className="text-right px-4 py-3.5 text-[#888899] font-semibold">Precio domicilio</th>
                <th className="text-center px-4 py-3.5 text-[#888899] font-semibold">Activa</th>
                <th className="text-right px-4 py-3.5 text-[#888899] font-semibold">Acc.</th>
              </tr>
            </thead>
            <tbody>
              {zonas.map((z) => (
                <tr key={z.id} className="border-b border-[#2E3038] last:border-0 hover:bg-[#22232B] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-[#D4A017] shrink-0" />
                      <span className={`font-medium ${z.active ? "text-[#F5F0E8]" : "text-[#555566] line-through"}`}>{z.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[#D4A017] font-mono font-bold">${z.price.toLocaleString("es-CO")}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(z)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        z.active
                          ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          : "bg-[#2E3038] text-[#555566] hover:bg-[#3E4048]"
                      }`}
                    >
                      {z.active ? "Activa" : "Inactiva"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(z)} className="p-2 text-[#888899] hover:text-[#D4A017] hover:bg-[#D4A017]/10 rounded-lg transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(z.id, z.name)} className="p-2 text-[#888899] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1B21] border border-[#2E3038] rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#2E3038]">
              <h2 className="text-[#F5F0E8] font-bold">{editingId ? "Editar zona" : "Nueva zona"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-[#888899] hover:text-[#F5F0E8]"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[#CCCCCC] text-xs mb-1.5 block">Nombre del barrio / zona *</label>
                <input className={inputCls} placeholder="Ej: Centro, El Poblado, Laureles..." value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
              </div>
              <div>
                <label className="text-[#CCCCCC] text-xs mb-1.5 block">Precio de domicilio (COP) *</label>
                <div className="flex items-center gap-2">
                  <span className="text-[#888899] text-sm">$</span>
                  <input className={inputCls} type="number" min="0" step="500" placeholder="3000" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-[#2E3038]">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-[#2E3038] text-[#CCCCCC] rounded-lg text-sm">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-[#D4A017] hover:bg-[#E8B830] disabled:opacity-50 text-[#111217] font-bold rounded-lg text-sm">
                {saving ? "Guardando..." : editingId ? "Actualizar" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
