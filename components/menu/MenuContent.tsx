"use client";

import { useState } from "react";
import { Category, MenuItem } from "@/lib/types";
import MenuItemCard from "./MenuItemCard";

interface MenuContentProps {
  categories: Category[];
  items: MenuItem[];
}

export default function MenuContent({ categories, items }: MenuContentProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredItems =
    activeCategory === "all"
      ? items
      : items.filter((i) => i.category_id === activeCategory);

  return (
    <div className="max-w-5xl mx-auto px-3 pb-4">
      {/* Banner barra libre */}
      <div className="mt-3 bg-[#D4A017] rounded-2xl px-4 py-3 flex items-center gap-2 mb-4">
        <span className="text-xl">🥗</span>
        <span className="text-[#111217] font-semibold text-xs">
          Barra de ensalada libre con cada hamburguesa
        </span>
      </div>

      {/* Category tabs */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3">
          <button
            onClick={() => setActiveCategory("all")}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeCategory === "all"
                ? "bg-[#D4A017] text-[#0F1117]"
                : "bg-[#22242C] text-[#9CA3AF] hover:text-white"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeCategory === cat.id
                  ? "bg-[#D4A017] text-[#0F1117]"
                  : "bg-[#22242C] text-[#9CA3AF] hover:text-white"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Product grid */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-[#6B7280]">
          <span className="text-5xl mb-3">🍔</span>
          <p className="text-sm">No hay productos en esta categoría</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
