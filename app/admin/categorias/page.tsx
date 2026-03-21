"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Category } from "@/lib/types";
import { Plus, Trash2, X, GripVertical, Pencil } from "lucide-react";
import toast from "react-hot-toast";

const EMOJIS = [
  "🍔","🌭","🍟","🥤","🍕","🌮","🥗","🍰","🎁","🥩","🍗","🥪",
  "🍱","🍜","🍣","🍦","☕","🥐","🧆","🫔","🥙","🌯","🫕","🥘",
  "🍲","🥗","🍤","🧇","🥞","🧈","🥚","🍳","🧀","🥓","🌽","🥨",
  "🍩","🍪","🎂","🍫","🍬","🧃","🍺","🥛","🧋","🫖","🍵","🥂",
];

const BRAND_EMOJIS = [
  { name: "burger",  label: "Burger"  },
  { name: "hotdog",  label: "Perro"   },
  { name: "fries",   label: "Papas"   },
  { name: "soda",    label: "Bebida"  },
  { name: "grill",   label: "Parrilla"},
  { name: "cheese",  label: "Queso"   },
  { name: "scooter", label: "Domicilio"},
  { name: "face",    label: "Carita"  },
  { name: "coupon",  label: "Cupón"   },
  { name: "timer",   label: "Timer"   },
  { name: "flame",   label: "Llama"   },
] as const;

type FormState = { name: string; description: string; emoji: string };
const EMPTY: FormState = { name: "", description: "", emoji: "🍽️" };

export default function AdminCategoriasPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setCategories(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, description: cat.description ?? "", emoji: cat.emoji ?? "🍽️" });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("El nombre es obligatorio"); return; }
    setSaving(true);
    try {
      if (editingId) {
        // UPDATE
        const { error } = await supabase.from("categories").update({
          name: form.name.trim(),
          description: form.description.trim() || null,
          emoji: form.emoji,
        }).eq("id", editingId);
        if (error) {
          if (error.code === "23505") toast.error("Ya existe una categoría con ese nombre");
          else throw error;
          return;
        }
        toast.success("Categoría actualizada");
      } else {
        // INSERT
        const { error } = await supabase.from("categories").insert({
          name: form.name.trim(),
          description: form.description.trim() || null,
          emoji: form.emoji,
          sort_order: categories.length + 1,
        });
        if (error) {
          if (error.code === "23505") toast.error("Ya existe una categoría con ese nombre");
          else throw error;
          return;
        }
        toast.success("Categoría creada");
      }
      setModalOpen(false);
      setForm(EMPTY);
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) return;
    const from = categories.findIndex((c) => c.id === draggingId);
    const to = categories.findIndex((c) => c.id === targetId);
    const reordered = [...categories];
    reordered.splice(to, 0, reordered.splice(from, 1)[0]);
    setCategories(reordered);
  };

  const handleDrop = async () => {
    setDraggingId(null);
    await Promise.all(
      categories.map((cat, i) =>
        supabase.from("categories").update({ sort_order: i + 1 }).eq("id", cat.id)
      )
    );
    toast.success("Orden guardado");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta categoría? Los productos en esta categoría quedarán sin categoría.")) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      toast.success("Categoría eliminada");
      fetchCategories();
    } catch {
      toast.error("Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  };

  const inputClass = "w-full bg-[#111217] border border-[#2E3038] rounded-xl px-4 py-2.5 text-[#F5F0E8] placeholder-[#555566] focus:outline-none focus:border-[#D4A017] transition-colors text-sm";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#F5F0E8] font-bold text-xl">Categorías</h1>
          <p className="text-[#888899] text-sm mt-0.5">Administra las categorías del menú</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#D4A017] text-[#111217] font-semibold px-4 py-2 rounded-xl text-sm hover:bg-[#E8B830] transition-colors"
        >
          <Plus size={16} /> Nueva categoría
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16 text-[#888899] text-sm">Cargando...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 bg-[#1A1B21] rounded-2xl border border-[#2E3038]">
          <p className="text-4xl mb-3">📂</p>
          <p className="text-[#888899] text-sm">No hay categorías. Crea la primera.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              draggable
              onDragStart={() => setDraggingId(cat.id)}
              onDragOver={(e) => handleDragOver(e, cat.id)}
              onDrop={handleDrop}
              onDragEnd={() => setDraggingId(null)}
              className={`bg-[#1A1B21] border rounded-2xl px-4 py-3.5 flex items-center gap-3 transition-all ${
                draggingId === cat.id
                  ? "opacity-40 border-[#D4A017]/50 scale-[0.98]"
                  : "border-[#2E3038] hover:border-[#2E3038]"
              }`}
            >
              <GripVertical size={16} className="text-[#444455] shrink-0 cursor-grab active:cursor-grabbing" />
              {cat.emoji && (
                cat.emoji.startsWith("brand:") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/emojis/${cat.emoji.replace("brand:", "")}.png`} alt="" width={28} height={28} className="object-contain shrink-0" />
                ) : (
                  <span className="text-2xl leading-none shrink-0">{cat.emoji}</span>
                )
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[#F5F0E8] font-semibold text-sm">{cat.name}</p>
                <p className="text-[#555566] text-xs font-mono mt-0.5">id: {cat.id}</p>
                {cat.description && (
                  <p className="text-[#888899] text-xs mt-0.5">{cat.description}</p>
                )}
              </div>
              <button
                onClick={() => openEdit(cat)}
                className="p-2 text-[#555566] hover:text-[#D4A017] transition-colors"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                disabled={deletingId === cat.id}
                className="p-2 text-[#555566] hover:text-red-400 transition-colors disabled:opacity-40"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hint */}
      <div className="mt-4 bg-[#1A1B21] border border-[#2E3038] rounded-xl px-4 py-3">
        <p className="text-[#888899] text-xs leading-relaxed">
          💡 Las categorías creadas aquí aparecen en el selector al crear o editar productos en <strong className="text-[#CCCCCC]">Menú</strong>.
        </p>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50">
          <div className="absolute inset-0 overflow-y-auto">
          <div className="flex items-end sm:items-center justify-center min-h-full p-4">
          <div className="bg-[#1A1B21] border border-[#2E3038] rounded-2xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[#F5F0E8] font-bold">{editingId ? "Editar categoría" : "Nueva categoría"}</h3>
              <button onClick={() => setModalOpen(false)} className="text-[#888899] hover:text-[#F5F0E8] p-1">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[#888899] text-xs font-medium mb-1.5 block">Nombre *</label>
                <input
                  className={inputClass}
                  placeholder="Ej: Hamburguesas, Bebidas, Perros..."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[#888899] text-xs font-medium mb-1.5 block">Descripción (opcional)</label>
                <input
                  className={inputClass}
                  placeholder="Ej: Nuestras hamburguesas artesanales"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Emoji picker */}
              <div>
                <label className="text-[#888899] text-xs font-medium mb-2 block">Emoji de marca</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {BRAND_EMOJIS.map((b) => {
                    const val = `brand:${b.name}`;
                    return (
                      <button
                        key={b.name}
                        type="button"
                        title={b.label}
                        onClick={() => setForm({ ...form, emoji: val })}
                        className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${
                          form.emoji === val
                            ? "bg-[#D4A017]/20 border-2 border-[#D4A017]"
                            : "bg-[#22242C] border border-[#2E3038] hover:border-[#D4A017]/50"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`/emojis/${b.name}.png`} alt={b.label} width={28} height={28} className="object-contain" />
                      </button>
                    );
                  })}
                </div>

                <label className="text-[#888899] text-xs font-medium mb-2 block">O elige un emoji de texto</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setForm({ ...form, emoji: e })}
                      className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all ${
                        form.emoji === e
                          ? "bg-[#D4A017]/20 border-2 border-[#D4A017]"
                          : "bg-[#22242C] border border-[#2E3038] hover:border-[#D4A017]/50"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#2E3038] text-[#888899] text-sm hover:text-[#F5F0E8] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="flex-1 py-2.5 rounded-xl bg-[#D4A017] text-[#111217] font-semibold text-sm hover:bg-[#E8B830] transition-colors disabled:opacity-50"
              >
                {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear categoría"}
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
