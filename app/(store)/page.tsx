import { createClient } from "@/lib/supabase/server";
import { Banner, MenuItem } from "@/lib/types";
import PremiumHomeExperience from "@/components/home/PremiumHomeExperience";

const HORARIO_APERTURA = 18;
const HORARIO_CIERRE = 23.99;

function isOpenBySchedule(): boolean {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(now);
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0");
  const currentHour = hour + minute / 60;
  return currentHour >= HORARIO_APERTURA && currentHour < HORARIO_CIERRE;
}

export const revalidate = 60;

type SpecialOffer = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  active: boolean;
};

export default async function Home() {
  const supabase = await createClient();

  const [{ data: banners }, { data: settings }, { data: items }, { data: specials }] = await Promise.all([
    supabase.from("banners").select("*").eq("active", true).order("sort_order"),
    supabase.from("settings").select("*").in("key", ["barra_libre_activa", "barra_libre_texto", "barra_libre_emoji"]),
    supabase.from("menu_items").select("*").eq("available", true).limit(6),
    supabase.from("specials_offers").select("*").eq("active", true).order("sort_order"),
  ]);

  const settingsMap: Record<string, string> = {};
  (settings ?? []).forEach((setting: { key: string; value: string }) => {
    settingsMap[setting.key] = setting.value;
  });

  return (
    <PremiumHomeExperience
      banners={(banners ?? []) as Banner[]}
      menuItems={(items ?? []) as MenuItem[]}
      offers={(specials ?? []) as SpecialOffer[]}
      isOpen={isOpenBySchedule()}
      barraActiva={settingsMap["barra_libre_activa"] !== "false"}
      barraTexto={settingsMap["barra_libre_texto"] ?? "Barra de ensalada libre con cada hamburguesa"}
      barraEmoji={settingsMap["barra_libre_emoji"] ?? "🥗"}
    />
  );
}
