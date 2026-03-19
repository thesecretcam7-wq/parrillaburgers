"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useStoreStatus() {
  const [isOpen, setIsOpen] = useState<boolean | null>(null); // null = cargando
  const [mensajeCerrado, setMensajeCerrado] = useState(
    "Estamos cerrados por el momento. Vuelve pronto 🕐"
  );

  useEffect(() => {
    createClient()
      .from("settings")
      .select("key, value")
      .in("key", ["local_abierto", "mensaje_cerrado"])
      .then(({ data }) => {
        if (!data) { setIsOpen(true); return; }

        let localAbierto = true;

        data.forEach((row) => {
          if (row.key === "local_abierto") localAbierto = row.value !== "false";
          if (row.key === "mensaje_cerrado") setMensajeCerrado(row.value);
        });

        setIsOpen(localAbierto);
      });
  }, []);

  return { isOpen, mensajeCerrado };
}
