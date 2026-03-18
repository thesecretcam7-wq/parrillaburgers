"use client";

import { useState } from "react";
import { ChevronRight, ArrowLeft, Search, X } from "lucide-react";
import { Category, MenuItem } from "@/lib/types";
import MenuItemCard from "./MenuItemCard";

interface MenuContentProps {
  categories: Category[];
  items: MenuItem[];
  barraActiva?: boolean;
  barraTexto?: string;
  barraEmoji?: string;
}

const FALLBACK_EMOJI: Record<string, string> = {
  hamburguesas: "🍔", bebidas: "🥤", perros: "🌭", otros: "🌭",
  acompañamientos: "🍟", combos: "🎁", postres: "🍰", entradas: "🥗",
};

function getCategoryEmoji(cat: Category): string {
  if (cat.emoji) return cat.emoji;
  const nameKey = cat.name.toLowerCase();
  for (const [k, emoji] of Object.entries(FALLBACK_EMOJI)) {
    if (nameKey.includes(k)) return emoji;
  }
  return "🍽️";
}

export default function MenuContent({
  categories,
  items,
  barraActiva = true,
  barraTexto = "Barra de ensalada libre con cada hamburguesa",
  barraEmoji = "🥗",
}: MenuContentProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();

  // Cuando hay búsqueda activa mostramos todos los items filtrados
  const searchResults = query
    ? items.filter(
        (i) =>
          i.name.toLowerCase().includes(query) ||
          (i.description ?? "").toLowerCase().includes(query)
      )
    : [];

  const activeItems = activeCategory
    ? items.filter((i) => i.category_id === activeCategory)
    : [];

  const activeCategoryName = categories.find((c) => c.id === activeCategory)?.name ?? "";

  // ── Search results screen ──────────────────────────────────────────────────
  if (query) {
    return (
      <div className="max-w-5xl mx-auto px-3 pb-24">
        {/* Search bar */}
        <div className="mt-3 mb-5">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        <p className="text-[#888899] text-xs mb-4 px-1">
          {searchResults.length === 0
            ? "Sin resultados"
            : `${searchResults.length} resultado${searchResults.length !== 1 ? "s" : ""} para "${search.trim()}"`}
        </p>

        {searchResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#6B7280]">
            <span className="text-5xl mb-3">🔍</span>
            <p className="text-sm">No encontramos "{search.trim()}"</p>
            <p className="text-xs mt-1">Intenta con otro nombre</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {searchResults.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Category selection screen ──────────────────────────────────────────────
  if (!activeCategory) {
    return (
      <div className="max-w-5xl mx-auto px-3 pb-24">
        {/* Banner barra libre */}
        {barraActiva && (
          <div className="mt-3 bg-[#D4A017] rounded-2xl px-4 py-3 flex items-center gap-2 mb-4">
            <span className="text-xl">{barraEmoji}</span>
            <span className="text-[#111217] font-semibold text-xs">{barraTexto}</span>
          </div>
        )}

        {/* Buscador */}
        <div className="mb-5">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        <h2 className="text-white font-bold text-base mb-3 px-1">¿Qué quieres comer?</h2>

        <div className="flex flex-col gap-3">
          {categories.map((cat) => {
            const count = items.filter((i) => i.category_id === cat.id).length;
            const emoji = getCategoryEmoji(cat);
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="w-full bg-[#1A1B21] border border-[#2E3038] rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-[#D4A017]/50 active:scale-[0.98] transition-all text-left"
              >
                <span className="text-4xl leading-none">{emoji}</span>
                <div className="flex-1">
                  <p className="text-white font-bold text-base">{cat.name}</p>
                  <p className="text-[#6B7280] text-xs mt-0.5">
                    {count} {count === 1 ? "producto" : "productos"}
                  </p>
                </div>
                <ChevronRight size={20} className="text-[#D4A017] shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Items screen ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-3 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mt-3 mb-4">
        <button
          onClick={() => setActiveCategory(null)}
          className="w-9 h-9 bg-[#22242C] rounded-full flex items-center justify-center shrink-0 hover:bg-[#2E3038] transition-colors"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-2xl leading-none">
            {getCategoryEmoji(categories.find((c) => c.id === activeCategory)!)}
          </span>
          <h2 className="text-white font-bold text-base">{activeCategoryName}</h2>
        </div>
      </div>

      {/* Buscador dentro de categoría */}
      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {activeItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-[#6B7280]">
          <span className="text-5xl mb-3">🍔</span>
          <p className="text-sm">No hay productos en esta categoría</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {activeItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Componente buscador reutilizable ──────────────────────────────────────────
function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar producto..."
        className="w-full bg-[#1A1B21] border border-[#2E3038] rounded-xl pl-10 pr-10 py-2.5 text-white text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#D4A017] transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white transition-colors"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
