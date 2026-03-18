"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MenuItem, Category } from "@/lib/types";
import { Plus, Pencil, Trash2, X, Check, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import ImageUpload from "@/components/admin/ImageUpload";

const DEFAULT_BARRA_LIBRE = [
  "Lechuga", "Tomate", "Cebolla", "Pepinillos", "Jalapeños",
  "Maíz", "Zanahoria", "Aguacate", "Champiñones", "Pimentón",
  "Ketchup", "Mostaza", "Mayonesa", "Salsa BBQ", "Salsa picante",
];

type FormState = {
  name: string;
  description: string;
  price: string;
  category_id: string;
  available: boolean;
  image_url: string;
  barra_libre_items: string[];
};

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  price: "",
  category_id: "",
  available: true,
  image_url: "",
  barra_libre_items: [],
};

export default function AdminMenuPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [barraLibreSugerencias, setBarraLibreSugerencias] = useState<string[]>(DEFAULT_BARRA_LIBRE);

  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Category form
  const [catModal, setCatModal] = useState(false);
  const [catName, setCatName] = useState("");
  const [savingCat, setSavingCat] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: cats }, { data: its }, { data: settingRow }] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("menu_items").select("*, category:categories(*)").order("sort_order"),
      supabase.from("settings").select("value").eq("key", "barra_libre_ingredientes").single(),
    ]);
    setCategories(cats ?? []);
    setItems(its ?? []);
    if (settingRow?.value) {
      try { setBarraLibreSugerencias(JSON.parse(settingRow.value)); } catch { /* keep default */ }
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openNew = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, category_id: categories[0]?.id ?? "" });
    setModalOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description ?? "",
      price: String(item.price),
      category_id: item.category_id,
      available: item.available,
      image_url: item.image_url ?? "",
      barra_libre_items: item.barra_libre_items ?? [],
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category_id) {
      toast.error("Nombre, precio y categoría son obligatorios");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        price: parseFloat(form.price),
        category_id: form.category_id,
        available: form.available,
        image_url: form.image_url || null,
        barra_libre_items: form.barra_libre_items.length > 0 ? form.barra_libre_items : null,
      };

      if (editingId) {
        const { error } = await supabase.from("menu_items").update(payload).eq("id", editingId);
        if (error) throw error;
        toast.success("Producto actualizado");
      } else {
        const { error } = await supabase.from("menu_items").insert(payload);
        if (error) throw error;
        toast.success("Producto creado");
      }
      setModalOpen(false);
      fetchData();
    } catch (e: any) {
      const msg = e?.message ?? JSON.stringify(e);
      toast.error(`Error: ${msg}`, { duration: 6000 });
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) { toast.error("Error al eliminar"); return; }
    toast.success("Producto eliminado");
    fetchData();
  };

  const toggleAvailable = async (item: MenuItem) => {
    await supabase.from("menu_items").update({ available: !item.available }).eq("id", item.id);
    fetchData();
  };

  const handleSaveCategory = async () => {
    if (!catName.trim()) return;
    setSavingCat(true);
    const { error } = await supabase.from("categories").insert({
      name: catName.trim(),
      sort_order: categories.length + 1,
    });
    if (error) { toast.error(`Error: ${error.message}`, { duration: 6000 }); } else { toast.success("Categoría creada"); fetchData(); }
    setCatName("");
    setCatModal(false);
    setSavingCat(false);
  };

  const filteredItems = activeCategory === "all"
    ? items
    : items.filter((i) => i.category_id === activeCategory);

  const handleItemDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) return;
    const from = items.findIndex((i) => i.id === draggingId);
    const to = items.findIndex((i) => i.id === targetId);
    const reordered = [...items];
    reordered.splice(to, 0, reordered.splice(from, 1)[0]);
    setItems(reordered);
  };

  const handleItemDrop = async () => {
    setDraggingId(null);
    await Promise.all(
      items.map((item, idx) =>
        supabase.from("menu_items").update({ sort_order: idx + 1 }).eq("id", item.id)
      )
    );
    toast.success("Orden guardado");
  };

  const inputCls = "w-full bg-[#111217] border border-[#2E3038] rounded-lg px-3 py-2.5 text-[#F5F0E8] placeholder-[#555566] focus:outline-none focus:border-[#D4A017] text-sm transition-colors";

  function BarraLibreCustomInput({ items, onChange }: { items: string[]; onChange: (i: string[]) => void }) {
    const [input, setInput] = useState("");
    const add = () => {
      const val = input.trim();
      if (val && !items.includes(val)) { onChange([...items, val]); }
      setInput("");
    };
    return (
      <div className="flex gap-2 mt-1">
        <input
          className="flex-1 bg-[#111217] border border-[#2E3038] rounded-lg px-3 py-1.5 text-[#F5F0E8] placeholder-[#555566] focus:outline-none focus:border-[#D4A017] text-xs transition-colors"
          placeholder="Otro ingrediente personalizado..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-1.5 bg-[#D4A017]/20 text-[#D4A017] text-xs rounded-lg hover:bg-[#D4A017]/30 transition-colors font-semibold"
        >
          + Agregar
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#F5F0E8]">Gestión de Menú</h1>
          <p className="text-[#888899] text-sm mt-1">{items.length} productos · {categories.length} categorías</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setCatModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#D4A017] text-[#D4A017] rounded-lg hover:bg-[#D4A017]/10 transition-colors text-sm font-semibold"
          >
            <Plus size={16} /> Nueva categoría
          </button>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#D4A017] hover:bg-[#E8B830] text-[#111217] rounded-lg transition-colors text-sm font-bold"
          >
            <Plus size={16} /> Nuevo producto
          </button>
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
            activeCategory === "all"
              ? "bg-[#D4A017] text-[#111217]"
              : "bg-[#22232B] text-[#CCCCCC] hover:text-[#D4A017]"
          }`}
        >
          Todos ({items.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              activeCategory === cat.id
                ? "bg-[#D4A017] text-[#111217]"
                : "bg-[#22232B] text-[#CCCCCC] hover:text-[#D4A017]"
            }`}
          >
            {cat.name} ({items.filter((i) => i.category_id === cat.id).length})
          </button>
        ))}
      </div>

      {/* Items table */}
      {loading ? (
        <div className="text-[#888899] text-center py-20">Cargando...</div>
      ) : (
        <div className="bg-[#1A1B21] border border-[#2E3038] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2E3038]">
                <th className="text-left px-4 py-3.5 text-[#888899] font-semibold">Producto</th>
                <th className="text-left px-4 py-3.5 text-[#888899] font-semibold hidden sm:table-cell">Categoría</th>
                <th className="text-right px-4 py-3.5 text-[#888899] font-semibold">Precio</th>
                <th className="text-center px-4 py-3.5 text-[#888899] font-semibold">Disp.</th>
                <th className="text-right px-4 py-3.5 text-[#888899] font-semibold">Acc.</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  draggable
                  onDragStart={() => setDraggingId(item.id)}
                  onDragOver={(e) => handleItemDragOver(e, item.id)}
                  onDrop={handleItemDrop}
                  onDragEnd={() => setDraggingId(null)}
                  className={`border-b border-[#2E3038] last:border-0 transition-colors cursor-grab active:cursor-grabbing ${
                    draggingId === item.id ? "opacity-40 bg-[#D4A017]/5" : "hover:bg-[#22232B]"
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#22232B] flex items-center justify-center shrink-0 overflow-hidden">
                        {item.image_url ? (
                          <Image src={item.image_url} alt={item.name} width={36} height={36} className="object-cover w-full h-full" unoptimized />
                        ) : (
                          <span className="text-base">🍔</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[#F5F0E8] font-semibold truncate max-w-[120px] sm:max-w-none">{item.name}</p>
                        {item.description && (
                          <p className="text-[#888899] text-xs mt-0.5 line-clamp-1 hidden sm:block">{item.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="bg-[#D4A017]/10 text-[#D4A017] text-xs px-2.5 py-1 rounded-full font-medium">
                      {(item.category as Category)?.name ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-[#F5F0E8] font-mono text-sm">
                    ${Number(item.price).toLocaleString("es-CO")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleAvailable(item)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-colors ${
                        item.available
                          ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      }`}
                    >
                      {item.available ? <Check size={14} /> : <X size={14} />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(item)}
                        className="p-2 text-[#888899] hover:text-[#D4A017] hover:bg-[#D4A017]/10 rounded-lg transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-2 text-[#888899] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-[#888899]">
                    No hay productos en esta categoría
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Product modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1B21] border border-[#2E3038] rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#2E3038]">
              <h2 className="text-[#F5F0E8] font-bold text-lg">
                {editingId ? "Editar producto" : "Nuevo producto"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-[#888899] hover:text-[#F5F0E8]">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[#CCCCCC] text-xs mb-1.5 block">Nombre *</label>
                <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Hamburguesa Clásica" />
              </div>
              <div>
                <label className="text-[#CCCCCC] text-xs mb-1.5 block">Descripción</label>
                <textarea className={`${inputCls} resize-none h-20`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ingredientes..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#CCCCCC] text-xs mb-1.5 block">Precio (COP) *</label>
                  <input className={inputCls} type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="9200" />
                </div>
                <div>
                  <label className="text-[#CCCCCC] text-xs mb-1.5 block">Categoría *</label>
                  <div className="relative">
                    <select
                      className={`${inputCls} appearance-none pr-8`}
                      value={form.category_id}
                      onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    >
                      <option value="">Seleccionar...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-3 text-[#888899] pointer-events-none" />
                  </div>
                </div>
              </div>
              <ImageUpload
                value={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
                aiHint={form.name ? `appetizing ${form.name} burger${form.description ? `, ${form.description}` : ""}, real food photography, dark elegant background, restaurant` : undefined}
              />

              {/* Barra libre */}
              <div>
                <label className="text-[#CCCCCC] text-xs mb-2 block">
                  🥗 Opciones de barra libre <span className="text-[#555566]">(opcional)</span>
                </label>

                {/* Sugerencias */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {barraLibreSugerencias.map((sug) => {
                    const active = form.barra_libre_items.includes(sug);
                    return (
                      <button
                        key={sug}
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            barra_libre_items: active
                              ? form.barra_libre_items.filter((i) => i !== sug)
                              : [...form.barra_libre_items, sug],
                          })
                        }
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                          active
                            ? "bg-[#D4A017] border-[#D4A017] text-[#111217] font-semibold"
                            : "border-[#2E3038] text-[#888899] hover:border-[#D4A017]/50"
                        }`}
                      >
                        {active && "✓ "}{sug}
                      </button>
                    );
                  })}
                </div>

                {/* Input para agregar ingrediente personalizado */}
                <BarraLibreCustomInput
                  items={form.barra_libre_items}
                  onChange={(items) => setForm({ ...form, barra_libre_items: items })}
                />

                {form.barra_libre_items.length > 0 && (
                  <p className="text-[#888899] text-[10px] mt-1.5">
                    {form.barra_libre_items.length} opción{form.barra_libre_items.length > 1 ? "es" : ""} configurada{form.barra_libre_items.length > 1 ? "s" : ""}
                  </p>
                )}
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => setForm({ ...form, available: e.target.checked })}
                  className="w-4 h-4 accent-[#D4A017]"
                />
                <span className="text-[#CCCCCC] text-sm">Disponible en el menú</span>
              </label>
            </div>
            <div className="flex gap-3 p-6 border-t border-[#2E3038]">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-[#2E3038] text-[#CCCCCC] rounded-lg hover:border-[#888899] transition-colors text-sm">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-[#D4A017] hover:bg-[#E8B830] disabled:opacity-50 text-[#111217] font-bold rounded-lg transition-colors text-sm"
              >
                {saving ? "Guardando..." : editingId ? "Actualizar" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category modal */}
      {catModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1B21] border border-[#2E3038] rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#2E3038]">
              <h2 className="text-[#F5F0E8] font-bold">Nueva categoría</h2>
              <button onClick={() => setCatModal(false)} className="text-[#888899] hover:text-[#F5F0E8]"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[#CCCCCC] text-xs mb-1.5 block">Nombre de la categoría</label>
                <input className={inputCls} value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Ej: Bebidas" />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-[#2E3038]">
              <button onClick={() => setCatModal(false)} className="flex-1 py-2.5 border border-[#2E3038] text-[#CCCCCC] rounded-lg hover:border-[#888899] transition-colors text-sm">Cancelar</button>
              <button
                onClick={handleSaveCategory}
                disabled={savingCat}
                className="flex-1 py-2.5 bg-[#D4A017] hover:bg-[#E8B830] disabled:opacity-50 text-[#111217] font-bold rounded-lg transition-colors text-sm"
              >
                {savingCat ? "Creando..." : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
