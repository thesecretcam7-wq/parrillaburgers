"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const HORARIO_APERTURA = 18; // 6pm
const HORARIO_CIERRE = 23.99; // 11:59pm

function isOpenBySchedule(): boolean {
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  return currentHour >= HORARIO_APERTURA && currentHour < HORARIO_CIERRE;
}

export function useStoreStatus() {
  const [isOpen, setIsOpen] = useState<boolean | null>(null); // null = cargando
  const [mensajeCerrado, setMensajeCerrado] = useState(
    "Horario: 6:00 PM - 11:59 PM todos los días"
  );

  useEffect(() => {
    createClient()
      .from("settings")
      .select("key, value")
      .in("key", ["local_abierto", "mensaje_cerrado"])
      .then(({ data }) => {
        // Validar primero si el local está abierto según horario
        const openBySchedule = isOpenBySchedule();
        let manualOverride = null;

        if (data) {
          data.forEach((row) => {
            if (row.key === "local_abierto") manualOverride = row.value !== "false";
            if (row.key === "mensaje_cerrado") setMensajeCerrado(row.value);
          });
        }

        // Si hay override manual, usarlo; si no, usar horario automático
        const finalStatus = manualOverride !== null ? manualOverride : openBySchedule;
        setIsOpen(finalStatus);
      });
  }, []);

  return { isOpen, mensajeCerrado };
}
