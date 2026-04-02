"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Plus, Trash2, Save } from "lucide-react";

type Offer = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  sort_order: number;
  active: boolean;
};

export default function OfertasPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOffer, setNewOffer] = useState({ title: "", emoji: "🎯", description: "", active: true });
  const [saving, setSaving] = useState(false);

  // Load offers
  useEffect(() => {
    const loadOffers = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("specials_offers")
          .select("*")
          .order("sort_order");

        if (error) throw error;
        setOffers(data || []);
      } catch (error) {
        console.error("Error loading offers:", error);
        toast.error("Error al cargar ofertas");
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
  }, []);

  // Add new offer
  const handleAddOffer = async () => {
    if (!newOffer.title || !newOffer.emoji || !newOffer.description) {
      toast.error("Completa todos los campos");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("specials_offers")
        .insert({
          title: newOffer.title,
          emoji: newOffer.emoji,
          description: newOffer.description,
          active: newOffer.active,
          sort_order: offers.length,
        })
        .select()
        .single();

      if (error) throw error;

      setOffers([...offers, data as Offer]);
      setNewOffer({ title: "", emoji: "🎯", description: "", active: true });
      toast.success("Oferta agregada");
    } catch (error) {
      console.error("Error adding offer:", error);
      toast.error("Error al agregar oferta");
    } finally {
      setSaving(false);
    }
  };

  // Update offer
  const handleUpdateOffer = async (id: string, field: string, value: any) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("specials_offers")
        .update({ [field]: value })
        .eq("id", id);

      if (error) throw error;

      setOffers(offers.map((o) => (o.id === id ? { ...o, [field]: value } : o)));
      toast.success("Oferta actualizada");
    } catch (error) {
      console.error("Error updating offer:", error);
      toast.error("Error al actualizar oferta");
    }
  };

  // Delete offer
  const handleDeleteOffer = async (id: string) => {
    if (!window.confirm("¿Eliminar esta oferta?")) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from("specials_offers").delete().eq("id", id);

      if (error) throw error;

      setOffers(offers.filter((o) => o.id !== id));
      toast.success("Oferta eliminada");
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast.error("Error al eliminar oferta");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A017]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-black mb-1">Ofertas Especiales</h1>
        <p className="text-[#9CA3AF] text-sm">
          Personaliza las ofertas que se muestran en la página principal
        </p>
      </div>

      {/* Add new offer */}
      <div className="bg-[#22242C] border border-[#2E3038] rounded-xl p-5 space-y-4">
        <h2 className="text-white font-bold flex items-center gap-2">
          <Plus size={18} className="text-[#D4A017]" />
          Nueva Oferta
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[#9CA3AF] text-xs mb-1.5 block font-medium">Título</label>
            <input
              type="text"
              placeholder="Ej: Combo Hamburguesero"
              value={newOffer.title}
              onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
              className="w-full bg-[#1A1B21] border border-[#2E3038] rounded-lg px-4 py-2.5 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#D4A017] text-sm"
            />
          </div>

          <div>
            <label className="text-[#9CA3AF] text-xs mb-1.5 block font-medium">Emoji</label>
            <input
              type="text"
              placeholder="🍔"
              maxLength={2}
              value={newOffer.emoji}
              onChange={(e) => setNewOffer({ ...newOffer, emoji: e.target.value })}
              className="w-full bg-[#1A1B21] border border-[#2E3038] rounded-lg px-4 py-2.5 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#D4A017] text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[#9CA3AF] text-xs mb-1.5 block font-medium">Descripción</label>
            <input
              type="text"
              placeholder="Ej: Hasta -30%"
              value={newOffer.description}
              onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
              className="w-full bg-[#1A1B21] border border-[#2E3038] rounded-lg px-4 py-2.5 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#D4A017] text-sm"
            />
          </div>
        </div>

        <button
          onClick={handleAddOffer}
          disabled={saving}
          className="w-full bg-[#D4A017] hover:bg-[#E8B92A] disabled:opacity-50 text-[#0F1117] font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Agregar Oferta
        </button>
      </div>

      {/* Existing offers */}
      <div className="space-y-3">
        <h2 className="text-white font-bold">Ofertas Activas ({offers.length})</h2>

        {offers.length === 0 ? (
          <div className="bg-[#22242C] border border-[#2E3038] rounded-xl p-6 text-center">
            <p className="text-[#9CA3AF]">No hay ofertas. Crea una nueva para comenzar.</p>
          </div>
        ) : (
          offers.map((offer, idx) => (
            <div key={offer.id} className="bg-[#22242C] border border-[#2E3038] rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[#9CA3AF] text-xs mb-1.5 block font-medium">Título</label>
                  <input
                    type="text"
                    value={offer.title}
                    onChange={(e) => handleUpdateOffer(offer.id, "title", e.target.value)}
                    className="w-full bg-[#1A1B21] border border-[#2E3038] rounded-lg px-4 py-2 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#D4A017] text-sm"
                  />
                </div>

                <div>
                  <label className="text-[#9CA3AF] text-xs mb-1.5 block font-medium">Emoji</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={offer.emoji}
                    onChange={(e) => handleUpdateOffer(offer.id, "emoji", e.target.value)}
                    className="w-full bg-[#1A1B21] border border-[#2E3038] rounded-lg px-4 py-2 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#D4A017] text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[#9CA3AF] text-xs mb-1.5 block font-medium">Descripción</label>
                  <input
                    type="text"
                    value={offer.description}
                    onChange={(e) => handleUpdateOffer(offer.id, "description", e.target.value)}
                    className="w-full bg-[#1A1B21] border border-[#2E3038] rounded-lg px-4 py-2 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#D4A017] text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-[#2E3038]">
                <label className="flex items-center gap-2 flex-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={offer.active}
                    onChange={(e) => handleUpdateOffer(offer.id, "active", e.target.checked)}
                    className="w-4 h-4 rounded bg-[#1A1B21] border border-[#D4A017] cursor-pointer"
                  />
                  <span className="text-[#9CA3AF] text-sm">Activa</span>
                </label>

                <button
                  onClick={() => handleDeleteOffer(offer.id)}
                  className="bg-red-600/20 hover:bg-red-600/30 text-red-400 p-2 rounded-lg transition-colors"
                  title="Eliminar oferta"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
