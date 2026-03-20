"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Banner } from "@/lib/types";
import { Plus, Trash2, X, Eye, EyeOff, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import ImageUpload from "@/components/admin/ImageUpload";

type FormState = {
  title: string;
  subtitle: string;
  image_url: string;
  active: boolean;
};

const EMPTY: FormState = { title: "", subtitle: "", image_url: "", active: true };

export default function AdminBannersPage() {
  const supabase = createClient();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    const { data } = await supabase.from("banners").select("*").order("sort_order");
    setBanners(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleSave = async () => {
    if (!form.image_url.trim()) { toast.error("Debes subir una imagen para el banner"); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from("banners").insert({
        title: form.title || null,
        subtitle: form.subtitle || null,
        image_url: form.image_url,
        active: form.active,
        sort_order: banners.length + 1,
      });
      if (error) throw error;
      toast.success("Banner creado");
      setModalOpen(false);
      setForm(EMPTY);
      fetchBanners();
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este banner?")) return;
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) { toast.error("Error"); return; }
    toast.success("Banner eliminado");
    fetchBanners();
  };

  const toggleActive = async (banner: Banner) => {
    await supabase.from("banners").update({ active: !banner.active }).eq("id", banner.id);
    fetchBanners();
  };

  const inputCls = "w-full bg-[#111217] border border-[#2E3038] rounded-lg px-3 py-2.5 text-[#F5F0E8] placeholder-[#555566] focus:outline-none focus:border-[#D4A017] text-sm transition-colors";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#F5F0E8]">Banners</h1>
          <p className="text-[#888899] text-sm mt-1">{banners.length} banners · {banners.filter(b => b.active).length} activos</p>
        </div>
        <button
          onClick={() => { setForm(EMPTY); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#D4A017] hover:bg-[#E8B830] text-[#111217] rounded-lg transition-colors text-sm font-bold"
        >
          <Plus size={16} /> Nuevo banner
        </button>
      </div>

      {loading ? (
        <div className="text-[#888899] text-center py-20">Cargando...</div>
      ) : banners.length === 0 ? (
        <div className="bg-[#1A1B21] border border-[#2E3038] border-dashed rounded-xl py-20 text-center">
          <ImageIcon size={40} className="text-[#2E3038] mx-auto mb-4" />
          <p className="text-[#888899]">No hay banners aún</p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-4 text-[#D4A017] hover:underline text-sm"
          >
            Crear el primero
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {banners.map((b) => (
            <div key={b.id} className={`bg-[#1A1B21] border rounded-xl overflow-hidden transition-all ${b.active ? "border-[#2E3038]" : "border-[#2E3038] opacity-60"}`}>
              {/* Image preview */}
              <div className="relative h-40 bg-[#111217] flex items-center justify-center overflow-hidden">
                {b.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.image_url} alt={b.title ?? "Banner"} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={40} className="text-[#2E3038]" />
                )}
                <div className="absolute top-2 right-2 flex gap-1.5">
                  <button
                    onClick={() => toggleActive(b)}
                    className={`p-1.5 rounded-lg backdrop-blur-sm transition-colors ${
                      b.active ? "bg-green-500/20 text-green-400" : "bg-[#111217]/80 text-[#888899]"
                    }`}
                    title={b.active ? "Desactivar" : "Activar"}
                  >
                    {b.active ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 rounded-lg bg-red-500/20 text-red-400 backdrop-blur-sm hover:bg-red-500/30 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {/* Info */}
              <div className="p-4">
                <p className="text-[#F5F0E8] font-semibold truncate">{b.title ?? "Sin título"}</p>
                {b.subtitle && <p className="text-[#888899] text-xs mt-0.5 truncate">{b.subtitle}</p>}
                <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${b.active ? "bg-green-500/15 text-green-400" : "bg-[#2E3038] text-[#888899]"}`}>
                  {b.active ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-full p-4">
          <div className="bg-[#1A1B21] border border-[#2E3038] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#2E3038]">
              <h2 className="text-[#F5F0E8] font-bold text-lg">Nuevo banner</h2>
              <button onClick={() => setModalOpen(false)} className="text-[#888899] hover:text-[#F5F0E8]"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <ImageUpload
                value={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
              />
              <div>
                <label className="text-[#CCCCCC] text-xs mb-1.5 block">Título (opcional)</label>
                <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ej: Promo de la semana" />
              </div>
              <div>
                <label className="text-[#CCCCCC] text-xs mb-1.5 block">Subtítulo (opcional)</label>
                <input className={inputCls} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Ej: 2x1 en hamburguesas" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-[#D4A017]" />
                <span className="text-[#CCCCCC] text-sm">Mostrar en el sitio</span>
              </label>
            </div>
            <div className="flex gap-3 p-6 border-t border-[#2E3038]">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-[#2E3038] text-[#CCCCCC] rounded-lg hover:border-[#888899] transition-colors text-sm">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-[#D4A017] hover:bg-[#E8B830] disabled:opacity-50 text-[#111217] font-bold rounded-lg transition-colors text-sm">
                {saving ? "Guardando..." : "Crear banner"}
              </button>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
