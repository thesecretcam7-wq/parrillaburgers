"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Search as SearchIcon, Trash2 } from "lucide-react";
import { MenuItem, Category } from "@/lib/types";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Props = {
  items: MenuItem[];
  categories: Category[];
  onClose: () => void;
};

const RECENT_SEARCHES_KEY = "pb-recent-searches";

export default function SearchModal({ items, categories, onClose }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading recent searches:", error);
    }
  }, []);

  // Filter items based on search and category
  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        search === "" ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.description?.toLowerCase() ?? "").includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === null || item.category_id === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory, items]);

  // Handle search submit
  const handleSearch = (query: string) => {
    if (query.trim() === "") return;

    // Add to recent searches
    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(
      0,
      5
    );
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));

    setSearch(query);
  };

  // Handle clearing recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  // Handle closing modal and cleaning state
  const handleClose = () => {
    setSearch("");
    onClose();
  };

  // Handle product click
  const handleProductClick = (item: MenuItem) => {
    handleSearch(item.name);
    // Optionally close the modal after selecting
    // onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-[2px] z-50 flex flex-col animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="bg-[#1A1B21] border-b border-[#2E3038] w-full shadow-xl animate-in slide-in-from-top-4 duration-300 max-h-[75vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="sticky top-0 bg-[#1A1B21]/95 backdrop-blur border-b border-[#2E3038] p-4 space-y-3 z-10">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <SearchIcon
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
              />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="w-full bg-[#22242C] border border-[#2E3038] focus:border-[#D4A017] rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-[#6B7280] outline-none transition-colors text-sm"
              />
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-full hover:bg-[#22242C] hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <X size={24} className="sm:size-20 text-[#9CA3AF]" />
            </button>
          </div>

          {/* Category filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95 shrink-0 ${
                selectedCategory === null
                  ? "bg-[#D4A017] text-[#0F1117]"
                  : "bg-[#22242C] text-[#9CA3AF] hover:bg-[#2E3038]"
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === cat.id ? null : cat.id
                  )
                }
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95 shrink-0 ${
                  selectedCategory === cat.id
                    ? "bg-[#D4A017] text-[#0F1117]"
                    : "bg-[#22242C] text-[#9CA3AF] hover:bg-[#2E3038]"
                }`}
              >
                {cat.emoji} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4">
          {/* Recent searches or results */}
          {search === "" ? (
            <>
              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[#9CA3AF] text-xs font-semibold uppercase tracking-wide">
                      Búsquedas recientes
                    </h3>
                    <button
                      onClick={clearRecentSearches}
                      className="text-[#D4A017] text-xs hover:opacity-80 transition-opacity flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      Limpiar
                    </button>
                  </div>
                  <div className="space-y-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSearch(term)}
                        className="w-full text-left px-3 py-2 rounded-lg bg-[#22242C] hover:bg-[#2E3038] hover:scale-105 active:scale-95 text-white text-sm transition-all duration-200"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular products */}
              {recentSearches.length === 0 && (
                <div className="text-center py-8">
                  <SearchIcon size={32} className="text-[#4B5563] mx-auto mb-3" />
                  <p className="text-[#6B7280] text-sm">Busca tus productos favoritos</p>
                </div>
              )}
            </>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#6B7280] text-sm">
                No encontramos "{search}"
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleProductClick(item)}
                  className="text-left bg-[#22242C] rounded-lg overflow-hidden border border-[#2E3038] shadow-md hover:border-[#D4A017]/50 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <div className="relative h-24 bg-[#1A1B21]">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        🍔
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <h4 className="text-white text-xs font-semibold line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-[#D4A017] text-xs font-bold mt-1">
                      ${Number(item.price).toLocaleString("es-CO")}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
