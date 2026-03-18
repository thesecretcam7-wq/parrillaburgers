import { createClient } from "@/lib/supabase/server";
import MenuContent from "@/components/menu/MenuContent";
import { MenuItem, Category } from "@/lib/types";

export const revalidate = 60;

const STATIC_CATEGORIES: Category[] = [
  { id: "hamburguesas", name: "Hamburguesas", description: null, emoji: "🍔", sort_order: 1, created_at: "" },
  { id: "otros", name: "Otros", description: null, emoji: "🌭", sort_order: 2, created_at: "" },
  { id: "acompañamientos", name: "Acompañamientos", description: null, emoji: "🍟", sort_order: 3, created_at: "" },
  { id: "combos", name: "Combos", description: null, emoji: "🎁", sort_order: 4, created_at: "" },
];

const STATIC_ITEMS: MenuItem[] = [
  { id: "1", name: "Clásica", description: "Carne artesanal · lechuga · tomate · tocineta · queso · salsa de la casa", price: 9200, category_id: "hamburguesas", image_url: null, available: true, sort_order: 1, created_at: "", barra_libre_items: null },
  { id: "2", name: "Argentina", description: "Clásica + chimichurri artesanal", price: 10200, category_id: "hamburguesas", image_url: null, available: true, sort_order: 2, created_at: "", barra_libre_items: null },
  { id: "3", name: "Mexicana", description: "Clásica + jalapeños", price: 10200, category_id: "hamburguesas", image_url: null, available: true, sort_order: 3, created_at: "", barra_libre_items: null },
  { id: "4", name: "Maicitos", description: "Clásica + maicitos + salsa especial", price: 10500, category_id: "hamburguesas", image_url: null, available: true, sort_order: 4, created_at: "", barra_libre_items: null },
  { id: "5", name: "Mixta", description: "Clásica pollo + clásica res", price: 12900, category_id: "hamburguesas", image_url: null, available: true, sort_order: 5, created_at: "", barra_libre_items: null },
  { id: "6", name: "Champiñones", description: "Clásica + champiñones", price: 11900, category_id: "hamburguesas", image_url: null, available: true, sort_order: 6, created_at: "", barra_libre_items: null },
  { id: "7", name: "Doble", description: "2 Clásica pollo o res", price: 13500, category_id: "hamburguesas", image_url: null, available: true, sort_order: 7, created_at: "", barra_libre_items: null },
  { id: "8", name: "Pollo", description: "Clásica pollo", price: 9200, category_id: "hamburguesas", image_url: null, available: true, sort_order: 8, created_at: "", barra_libre_items: null },
  { id: "9", name: "Pollo Champiñones", description: "Clásica pollo + champiñones", price: 11900, category_id: "hamburguesas", image_url: null, available: true, sort_order: 9, created_at: "", barra_libre_items: null },
  { id: "10", name: "Choripan", description: "Chorizo argentino + pan + chimichurri artesanal + queso", price: 12000, category_id: "otros", image_url: null, available: true, sort_order: 1, created_at: "", barra_libre_items: null },
  { id: "11", name: "Perro", description: "Salchicha de la casa + queso", price: 7900, category_id: "otros", image_url: null, available: true, sort_order: 2, created_at: "", barra_libre_items: null },
  { id: "12", name: "Chuzo", description: "Pollo + tocineta", price: 10900, category_id: "otros", image_url: null, available: true, sort_order: 3, created_at: "", barra_libre_items: null },
  { id: "13", name: "Papas", description: "Francesas o cascos", price: 4000, category_id: "acompañamientos", image_url: null, available: true, sort_order: 1, created_at: "", barra_libre_items: null },
  { id: "14", name: "Mazorca", description: "Crema agria + queso costeño + sal de chile", price: 4500, category_id: "acompañamientos", image_url: null, available: true, sort_order: 2, created_at: "", barra_libre_items: null },
  { id: "15", name: "Combo 1", description: "Tu hamburguesa + gaseosa o agua + papas", price: 5000, category_id: "combos", image_url: null, available: true, sort_order: 1, created_at: "", barra_libre_items: null },
  { id: "16", name: "Combo 2", description: "Tu hamburguesa + cerveza + papas", price: 6500, category_id: "combos", image_url: null, available: true, sort_order: 2, created_at: "", barra_libre_items: null },
  { id: "17", name: "Combo 3", description: "Tu hamburguesa + soda italiana + papas", price: 8500, category_id: "combos", image_url: null, available: true, sort_order: 3, created_at: "", barra_libre_items: null },
];

export default async function MenuPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: items }, { data: settings }, { data: recentOrders }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("menu_items").select("*").eq("available", true).order("sort_order"),
    supabase.from("settings").select("*").in("key", ["barra_libre_activa", "barra_libre_texto", "barra_libre_emoji", "local_abierto", "mensaje_cerrado", "horarios"]),
    supabase.from("orders").select("items").neq("status", "cancelled").order("created_at", { ascending: false }).limit(200),
  ]);

  const finalCategories = (categories && categories.length > 0) ? categories as Category[] : STATIC_CATEGORIES;
  const finalItems = (items && items.length > 0) ? items as MenuItem[] : STATIC_ITEMS;

  // Compute top sellers from recent orders
  const countMap: Record<string, number> = {};
  for (const order of (recentOrders ?? [])) {
    for (const item of (order.items as any[] ?? [])) {
      const id = item.menu_item_id ?? item.id;
      if (id) countMap[id] = (countMap[id] ?? 0) + (item.quantity ?? 1);
    }
  }
  const topItems = Object.entries(countMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id]) => finalItems.find((i) => i.id === id))
    .filter(Boolean) as MenuItem[];

  const settingsMap: Record<string, string> = {};
  (settings ?? []).forEach((s: { key: string; value: string }) => { settingsMap[s.key] = s.value; });
  const barraActiva = settingsMap["barra_libre_activa"] !== "false";
  const barraTexto = settingsMap["barra_libre_texto"] ?? "Barra de ensalada libre con cada hamburguesa";
  const barraEmoji = settingsMap["barra_libre_emoji"] ?? "🥗";
  const manualAbierto = settingsMap["local_abierto"] !== "false";
  const mensajeCerrado = settingsMap["mensaje_cerrado"] ?? "Estamos cerrados por el momento. Vuelve pronto 🕐";

  // Verificar horario automático (zona horaria Colombia UTC-5)
  let localAbierto = manualAbierto;
  if (manualAbierto && settingsMap["horarios"]) {
    try {
      const horarios = JSON.parse(settingsMap["horarios"]);
      const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }));
      const dayKey = String(now.getDay());
      const dia = horarios[dayKey];
      if (dia) {
        if (!dia.active) {
          localAbierto = false;
        } else {
          const [openH, openM] = dia.open.split(":").map(Number);
          const [closeH, closeM] = dia.close.split(":").map(Number);
          const currentMin = now.getHours() * 60 + now.getMinutes();
          const openMin = openH * 60 + openM;
          const closeMin = closeH * 60 + closeM;
          localAbierto = currentMin >= openMin && currentMin < closeMin;
        }
      }
    } catch { /* keep manual value */ }
  }

  return (
    <main className="min-h-screen bg-[#0F1117]">
      <MenuContent
        categories={finalCategories}
        items={finalItems}
        topItems={topItems}
        barraActiva={barraActiva}
        barraTexto={barraTexto}
        barraEmoji={barraEmoji}
        localAbierto={localAbierto}
        mensajeCerrado={mensajeCerrado}
      />
    </main>
  );
}
