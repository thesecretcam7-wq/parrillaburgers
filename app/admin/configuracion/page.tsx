"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Save, Eye, EyeOff } from "lucide-react";

const EMOJIS = ["🥗","🥬","🥦","🥕","🍅","🫑","🧅","🧄","🫒","🌽","🥒","🥑","🍋","🍓","🍇","🍉","🍎"];

export default function ConfiguracionPage() {
  const supabase = createClient();
  const [activa, setActiva] = useState(true);
  const [texto, setTexto] = useState("");
  const [emoji, setEmoji] = useState("🥗");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("settings")
      .select("*")
      .in("key", ["barra_libre_activa", "barra_libre_texto", "barra_libre_emoji"])
      .then(({ data }) => {
        if (!data) return;
        data.forEach((row) => {
          if (row.key === "barra_libre_activa") setActiva(row.value === "true");
          if (row.key === "barra_libre_texto") setTexto(row.value);
          if (row.key === "barra_libre_emoji") setEmoji(row.value);
        });
        setLoading(false);
      });
  }, []);

  async function save() {
    setSaving(true);
    const updates = [
      { key: "barra_libre_activa", value: activa ? "true" : "false" },
      { key: "barra_libre_texto", value: texto },
      { key: "barra_libre_emoji", value: emoji },
    ];
    const { error } = await supabase
      .from("settings")
      .upsert(updates, { onConflict: "key" });
    setSaving(false);
    if (error) toast.error("Error al guardar");
    else toast.success("Guardado correctamente");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-black text-[#F5F0E8] mb-8">Configuración</h1>

      <div className="bg-[#22232B] border border-[#2E3038] rounded-xl p-6 space-y-6">
        <h2 className="text-[#F5F0E8] font-bold text-lg">Barra de Ensalada Libre</h2>

        {/* Preview */}
        <div className={`w-full border rounded-2xl px-4 py-3 flex items-center gap-3 transition-opacity ${
          activa
            ? "bg-[#2A2414] border-[#D4A017]/30 opacity-100"
            : "bg-[#1A1B21] border-[#2E3038] opacity-40"
        }`}>
          <span className="text-2xl">{emoji}</span>
          <p className="text-[#E8B830] text-xs font-medium text-left">{texto || "Escribe el mensaje..."}</p>
        </div>

        {/* Activar / desactivar */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#F5F0E8] text-sm font-medium">Mostrar banner</p>
            <p className="text-[#888899] text-xs mt-0.5">Visible en la página de inicio</p>
          </div>
          <button
            onClick={() => setActiva(!activa)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activa
                ? "bg-[#D4A017]/20 text-[#D4A017] hover:bg-[#D4A017]/30"
                : "bg-[#2E3038] text-[#888899] hover:bg-[#3E4048]"
            }`}
          >
            {activa ? <Eye size={15} /> : <EyeOff size={15} />}
            {activa ? "Visible" : "Oculto"}
          </button>
        </div>

        {/* Texto */}
        <div>
          <label className="block text-[#F5F0E8] text-sm font-medium mb-2">Mensaje</label>
          <input
            type="text"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            maxLength={100}
            className="w-full bg-[#1A1B21] border border-[#2E3038] rounded-lg px-4 py-2.5 text-[#F5F0E8] text-sm focus:outline-none focus:border-[#D4A017] transition-colors"
            placeholder="Ej: Barra de ensalada libre con cada hamburguesa"
          />
          <p className="text-[#888899] text-xs mt-1 text-right">{texto.length}/100</p>
        </div>

        {/* Emoji */}
        <div>
          <label className="block text-[#F5F0E8] text-sm font-medium mb-2">Emoji</label>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`text-xl w-10 h-10 rounded-lg transition-all ${
                  emoji === e
                    ? "bg-[#D4A017]/20 ring-2 ring-[#D4A017]"
                    : "bg-[#1A1B21] hover:bg-[#2E3038]"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Guardar */}
        <button
          onClick={save}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-[#D4A017] text-[#0F1117] font-bold py-3 rounded-xl hover:bg-[#E8B830] transition-colors disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
