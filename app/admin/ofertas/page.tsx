"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Edit2, X } from "lucide-react";
import toast from "react-hot-toast";

type SpecialOffer = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  active: boolean;
};

export default function OfertasPage() {
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SpecialOffer | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchOffers();
  }, []);

  async function fetchOffers() {
    setLoading(true);
    const { data } = await supabase.from("specials_offers").select("*").order("sort_order");
    setOffers((data ?? []) as SpecialOffer[]);
    setLoading(false);
  }

  async function saveOffer(formData: any) {
    try {
      if (editing) {
        await supabase.from("specials_offers").update(formData).eq("id", editing.id);
        toast.success("Actualizada");
      } else {
        await supabase.from("specials_offers").insert([formData]);
        toast.success("Creada");
      }
      setEditing(null);
      setIsOpen(false);
      fetchOffers();
    } catch (err) {
      toast.error("Error");
    }
  }

  async function deleteOffer(id: string) {
    if (!confirm("Eliminar?")) return;
    try {
      await supabase.from("specials_offers").delete().eq("id", id);
      toast.success("Eliminada");
      fetchOffers();
    } catch {
      toast.error("Error");
    }
  }

  async function toggleActive(id: string, active: boolean) {
    try {
      await supabase.from("specials_offers").update({ active: !active }).eq("id", id);
      fetchOffers();
    } catch {
      toast.error("Error");
    }
  }

  if (loading) return <div className="flex justify-center items-center h-96"><div className="w-8 h-8 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-white">Ofertas Especiales</h1>
        <button onClick={() => { setEditing(null); setIsOpen(true); }} className="flex gap-2 items-center bg-[#D4A017] text-[#0F1117] font-bold px-6 py-3 rounded-xl">
          <Plus size={18} /> Nueva
        </button>
      </div>

      {isOpen && <OfertaForm offer={editing} onSave={saveOffer} onClose={() => { setIsOpen(false); setEditing(null); }} />}

      {offers.length === 0 ? (
        <div className="bg-[#1A1B21] rounded-2xl p-8 text-center">
          <p className="text-[#6B7280] mb-4">Sin ofertas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offers.map((offer) => (
            <div key={offer.id} className="bg-[#1A1B21] rounded-2xl p-4 border border-[#2E3038]">
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="flex gap-2 mb-2">
                    <span className="text-3xl">{offer.emoji}</span>
                    <div>
                      <p className="text-white font-bold text-sm">{offer.title}</p>
                      <p className="text-[#6B7280] text-xs">{offer.description}</p>
                    </div>
                  </div>
                  <label className="flex gap-2 items-center cursor-pointer mt-3">
                    <input type="checkbox" checked={offer.active} onChange={() => toggleActive(offer.id, offer.active)} className="w-4 h-4 accent-[#D4A017]" />
                    <span className="text-xs text-[#6B7280]">{offer.active ? "Activa" : "Inactiva"}</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(offer); setIsOpen(true); }} className="p-2 bg-[#2E3038] rounded-lg text-[#D4A017]">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => deleteOffer(offer.id)} className="p-2 bg-red-500/10 rounded-lg text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OfertaForm({ offer, onSave, onClose }: any) {
  const [title, setTitle] = useState(offer?.title ?? "");
  const [emoji, setEmoji] = useState(offer?.emoji ?? "");
  const [description, setDescription] = useState(offer?.description ?? "");
  const [active, setActive] = useState(offer?.active ?? true);

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#1A1B21] rounded-2xl p-6 w-full max-w-md border border-[#2E3038]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white font-bold">{offer ? "Editar" : "Nueva Oferta"}</h2>
          <button onClick={onClose} className="text-[#6B7280]"><X size={20} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#6B7280] uppercase block mb-2">Título</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Combo Hamburguesero" className="w-full bg-[#22242C] text-white px-3 py-2 rounded-lg border border-[#2E3038] focus:border-[#D4A017] outline-none text-sm" />
          </div>

          <div>
            <label className="text-xs text-[#6B7280] uppercase block mb-2">Emoji</label>
            <input type="text" value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="🍔" maxLength={2} className="w-full bg-[#22242C] text-white px-3 py-2 rounded-lg border border-[#2E3038] focus:border-[#D4A017] outline-none text-sm" />
          </div>

          <div>
            <label className="text-xs text-[#6B7280] uppercase block mb-2">Descripción</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Hasta -30%" className="w-full bg-[#22242C] text-white px-3 py-2 rounded-lg border border-[#2E3038] focus:border-[#D4A017] outline-none text-sm" />
          </div>

          <label className="flex gap-2 items-center cursor-pointer">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4 accent-[#D4A017]" />
            <span className="text-sm text-[#6B7280]">Activa en home</span>
          </label>

          <div className="flex gap-3 pt-4">
            <button onClick={onClose} className="flex-1 bg-[#2E3038] text-white font-bold py-2 rounded-lg">Cancelar</button>
            <button onClick={() => onSave({ title, emoji, description, active })} className="flex-1 bg-[#D4A017] text-[#0F1117] font-bold py-2 rounded-lg">{offer ? "Actualizar" : "Crear"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
