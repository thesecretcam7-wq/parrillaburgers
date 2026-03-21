"use client";

import { useEffect, useState } from "react";
import { ChevronRight, ArrowLeft, Search, X } from "lucide-react";
import { Category, MenuItem } from "@/lib/types";
import MenuItemCard from "./MenuItemCard";
import { BrandEmoji, BrandEmojiName } from "@/components/ui/BrandEmoji";

function CategoryIcon({ cat, size = 40 }: { cat: Category; size?: number }) {
  if (cat.emoji?.startsWith("brand:")) {
    const name = cat.emoji.replace("brand:", "") as BrandEmojiName;
    return <BrandEmoji name={name} size={size} />;
  }
  if (cat.emoji) return <span style={{ fontSize: size * 0.85 }} className="leading-none">{cat.emoji}</span>;
  return <BrandEmoji name="burger" size={size} />;
}

interface MenuContentProps {
  categories: Category[];
  items: MenuItem[];
  topItems?: MenuItem[];
  barraActiva?: boolean;
  barraTexto?: string;
  barraEmoji?: string;
  localAbierto?: boolean;
  mensajeCerrado?: string;
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
  topItems = [],
  barraActiva = true,
  barraTexto = "Barra de ensalada libre con cada hamburguesa",
  barraEmoji = "🥗",
  localAbierto = true,
  mensajeCerrado = "Estamos cerrados por el momento. Vuelve pronto 🕐",
}: MenuContentProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [highlightItemId, setHighlightItemId] = useState<string | null>(null);

  useEffect(() => {
    if (!highlightItemId) return;
    const t = setTimeout(() => {
      document.getElementById(`item-${highlightItemId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      const t2 = setTimeout(() => setHighlightItemId(null), 1800);
      return () => clearTimeout(t2);
    }, 80);
    return () => clearTimeout(t);
  }, [highlightItemId]);

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
        {/* Banner local cerrado */}
        {!localAbierto && (
          <div className="mt-3 bg-red-500/15 border border-red-500/30 rounded-2xl px-4 py-3 flex items-center gap-2 mb-4">
            <span className="text-xl">🔒</span>
            <span className="text-red-300 font-semibold text-xs">{mensajeCerrado}</span>
          </div>
        )}

        {/* Banner barra libre */}
        {barraActiva && localAbierto && (
          <div className="mt-3 bg-[#D4A017] rounded-2xl px-4 py-3 flex items-center gap-2 mb-4">
            <span className="text-xl">{barraEmoji}</span>
            <span className="text-[#111217] font-semibold text-xs">{barraTexto}</span>
          </div>
        )}

        {/* Buscador */}
        <div className="mb-5">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        {/* Lo más pedido */}
        {topItems.length > 0 && (
          <div className="mb-5">
            <h2 className="text-white font-bold text-base mb-3 px-1 flex items-center gap-2"><BrandEmoji name="flame" size={26} /> Lo más pedido</h2>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-3 px-3 scrollbar-none">
              {topItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveCategory(item.category_id); setHighlightItemId(item.id); }}
                  className="flex-none w-36 bg-[#1A1B21] border border-[#2E3038] rounded-2xl p-3 text-left hover:border-[#D4A017]/50 active:scale-[0.97] transition-all"
                >
                  <div className="mb-2">{
                    (() => {
                      const cat = categories.find((c) => c.id === item.category_id);
                      return cat ? <CategoryIcon cat={cat} size={32} /> : <BrandEmoji name="burger" size={32} />;
                    })()
                  }</div>
                  <p className="text-white font-semibold text-xs leading-tight line-clamp-2">{item.name}</p>
                  <p className="text-[#D4A017] font-bold text-xs mt-1">${item.price.toLocaleString("es-CO")}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-white font-bold text-base mb-3 px-1 flex items-center gap-2"><BrandEmoji name="burger" size={26} /> ¿Qué quieres comer?</h2>

        <div className="flex flex-col gap-3">
          {categories.map((cat) => {
            const count = items.filter((i) => i.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="w-full bg-[#1A1B21] border border-[#2E3038] rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-[#D4A017]/50 active:scale-[0.98] transition-all text-left"
              >
                <CategoryIcon cat={cat} size={48} />
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
          <CategoryIcon cat={categories.find((c) => c.id === activeCategory)!} size={28} />
          <h2 className="text-white font-bold text-base">{activeCategoryName}</h2>
        </div>
      </div>

      {/* Buscador dentro de categoría */}
      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {activeItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-[#6B7280]">
          <BrandEmoji name="burger" size={64} className="mb-3" />
          <p className="text-sm">No hay productos en esta categoría</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {activeItems.map((item) => (
            <div
              key={item.id}
              id={`item-${item.id}`}
              className={`rounded-2xl transition-all duration-300 ${highlightItemId === item.id ? "ring-2 ring-[#D4A017] ring-offset-2 ring-offset-[#0F1117]" : ""}`}
            >
              <MenuItemCard item={item} />
            </div>
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
