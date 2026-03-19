"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type HorarioDia = { active: boolean; open: string; close: string };
type Horarios = Record<string, HorarioDia>;

function checkOpenNow(localAbierto: boolean, horarios: Horarios): boolean {
  if (!localAbierto) return false;

  const now = new Date();
  const day = String(now.getDay()); // 0=Dom … 6=Sab
  const dia = horarios[day];
  if (!dia || !dia.active) return false;

  const [oh, om] = dia.open.split(":").map(Number);
  const [ch, cm] = dia.close.split(":").map(Number);
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const openMin = oh * 60 + om;
  const closeMin = ch * 60 + cm;

  return currentMin >= openMin && currentMin < closeMin;
}

export function useStoreStatus() {
  const [isOpen, setIsOpen] = useState<boolean | null>(null); // null = cargando
  const [mensajeCerrado, setMensajeCerrado] = useState(
    "Estamos cerrados por el momento. Vuelve pronto 🕐"
  );

  useEffect(() => {
    createClient()
      .from("settings")
      .select("key, value")
      .in("key", ["local_abierto", "horarios", "mensaje_cerrado"])
      .then(({ data }) => {
        if (!data) { setIsOpen(true); return; }

        let localAbierto = true;
        let horarios: Horarios = {};

        data.forEach((row) => {
          if (row.key === "local_abierto") localAbierto = row.value !== "false";
          if (row.key === "horarios") {
            try { horarios = JSON.parse(row.value); } catch { /* keep empty */ }
          }
          if (row.key === "mensaje_cerrado") setMensajeCerrado(row.value);
        });

        setIsOpen(checkOpenNow(localAbierto, horarios));
      });
  }, []);

  return { isOpen, mensajeCerrado };
}
