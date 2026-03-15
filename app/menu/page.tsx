import { createClient } from "@/lib/supabase/server";
import MenuItemCard from "@/components/menu/MenuItemCard";
import { MenuItem, Category } from "@/lib/types";

export const revalidate = 60;

export default async function MenuPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  const { data: items } = await supabase
    .from("menu_items")
    .select("*, category:categories(*)")
    .eq("available", true)
    .order("sort_order");

  const grouped = (categories ?? []).map((cat: Category) => ({
    category: cat,
    items: (items ?? []).filter((i: MenuItem) => i.category_id === cat.id),
  }));

  return (
    <main className="min-h-screen bg-[#111217] px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[#D4A017] text-sm uppercase tracking-widest mb-2">
            Lo que tenemos para ti
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-[#F5F0E8]">
            Nuestro Menú
          </h1>
          <p className="text-[#888899] mt-3">
            Barra de ensalada libre con cada hamburguesa
          </p>
        </div>

        {/* Barra de ensalada libre badge */}
        <div className="bg-[#D4A017]/10 border border-[#D4A017]/30 rounded-xl px-6 py-3 mb-10 text-center">
          <span className="text-[#D4A017] font-semibold text-sm">
            🥗 Barra de ensalada libre: Cebolla caramelizada · Guacamole · Pepinillos · Tomate · Lechuga
          </span>
        </div>

        {grouped.length === 0 ? (
          // Fallback con menú estático si no hay Supabase configurado
          <StaticMenu />
        ) : (
          grouped.map(({ category, items: catItems }) => (
            <section key={category.id} className="mb-14">
              <h2 className="text-2xl font-bold text-[#F5F0E8] mb-6 flex items-center gap-3">
                <span className="w-1 h-7 bg-[#D4A017] rounded-full inline-block" />
                {category.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {catItems.map((item: MenuItem) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </main>
  );
}

// Menú estático para cuando aún no está conectado Supabase
function StaticMenu() {
  const sections = [
    {
      name: "Hamburguesas",
      items: [
        { id: "1", name: "Clásica", description: "Carne artesanal · lechuga · tomate · tocineta · queso · salsa de la casa", price: 9200 },
        { id: "2", name: "Argentina", description: "Clásica + chimichurri artesanal", price: 10200 },
        { id: "3", name: "Mexicana", description: "Clásica + jalapeños", price: 10200 },
        { id: "4", name: "Maicitos", description: "Clásica + macitos + salsa especial", price: 10500 },
        { id: "5", name: "Mixta", description: "Clásica pollo + clásica res", price: 12900 },
        { id: "6", name: "Champiñones", description: "Clásica + champiñones", price: 11900 },
        { id: "7", name: "Doble", description: "2 Clásica pollo o res", price: 13500 },
        { id: "8", name: "Pollo", description: "Clásica pollo", price: 9200 },
        { id: "9", name: "Pollo Champiñones", description: "Clásica pollo + champiñones", price: 11900 },
      ],
    },
    {
      name: "Otros",
      items: [
        { id: "10", name: "Choripan", description: "Chorizo argentino + pan + chimichurri artesanal + queso", price: 12000 },
        { id: "11", name: "Perro", description: "Salchicha de la casa + queso", price: 7900 },
        { id: "12", name: "Chuzo", description: "Pollo + tocineta", price: 10900 },
      ],
    },
    {
      name: "Acompañamientos",
      items: [
        { id: "13", name: "Papas", description: "Francesas o cascos", price: 4000 },
        { id: "14", name: "Mazorca", description: "Crema agria + queso costeño + sal de chile", price: 4500 },
      ],
    },
    {
      name: "Combos",
      items: [
        { id: "15", name: "Combo 1", description: "Tu hamburguesa + gaseosa o agua + papas", price: 5000 },
        { id: "16", name: "Combo 2", description: "Tu hamburguesa + cerveza + papas", price: 6500 },
        { id: "17", name: "Combo 3", description: "Tu hamburguesa + soda italiana + papas", price: 8500 },
      ],
    },
  ];

  return (
    <>
      {sections.map((section) => (
        <section key={section.name} className="mb-14">
          <h2 className="text-2xl font-bold text-[#F5F0E8] mb-6 flex items-center gap-3">
            <span className="w-1 h-7 bg-[#D4A017] rounded-full inline-block" />
            {section.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {section.items.map((item) => (
              <MenuItemCard
                key={item.id}
                item={{
                  ...item,
                  category_id: "",
                  image_url: null,
                  available: true,
                  sort_order: 0,
                  created_at: "",
                }}
              />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
