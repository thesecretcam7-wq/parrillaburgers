"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Save, Eye, EyeOff, Bike, Store, MessageCircle, Plus, X, Clock } from "lucide-react";

const EMOJIS = ["🥗","🥬","🥦","🥕","🍅","🫑","🧅","🧄","🫒","🌽","🥒","🥑","🍋","🍓","🍇","🍉","🍎"];

// ── Helpers formato 12h ──────────────────────────────────────────────────────
function to12h(time24: string): { hour: string; minute: string; period: "AM" | "PM" } {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? "12" : String(h % 12);
  return { hour, minute: String(m).padStart(2, "0"), period };
}

function to24h(hour: string, minute: string, period: "AM" | "PM"): string {
  let h = Number(hour);
  if (period === "AM" && h === 12) h = 0;
  if (period === "PM" && h !== 12) h += 12;
  return `${String(h).padStart(2, "0")}:${minute}`;
}

function TimePicker12h({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { hour, minute, period } = to12h(value);
  const selectCls = "bg-[#111217] border border-[#2E3038] rounded-lg px-2 py-1.5 text-[#F5F0E8] text-xs focus:outline-none focus:border-[#D4A017] transition-colors";
  const update = (h: string, m: string, p: "AM" | "PM") => onChange(to24h(h, m, p));
  return (
    <div className="flex items-center gap-1">
      <select className={selectCls} value={hour} onChange={(e) => update(e.target.value, minute, period)}>
        {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>
      <span className="text-[#555566] text-xs">:</span>
      <select className={selectCls} value={minute} onChange={(e) => update(hour, e.target.value, period)}>
        {["00","15","30","45"].map((m) => <option key={m} value={m}>{m}</option>)}
      </select>
      <select className={selectCls} value={period} onChange={(e) => update(hour, minute, e.target.value as "AM" | "PM")}>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}

const DIAS = [
  { key: "1", label: "Lunes" },
  { key: "2", label: "Martes" },
  { key: "3", label: "Miércoles" },
  { key: "4", label: "Jueves" },
  { key: "5", label: "Viernes" },
  { key: "6", label: "Sábado" },
  { key: "0", label: "Domingo" },
];

type HorarioDia = { active: boolean; open: string; close: string };
type Horarios = Record<string, HorarioDia>;

const DEFAULT_HORARIOS: Horarios = Object.fromEntries(
  ["0","1","2","3","4","5","6"].map((d) => [d, { active: d !== "0", open: "11:00", close: "22:00" }])
);

const DEFAULT_INGREDIENTES = [
  "Lechuga","Tomate","Cebolla","Pepinillos","Jalapeños",
  "Maíz","Zanahoria","Aguacate","Champiñones","Pimentón",
  "Ketchup","Mostaza","Mayonesa","Salsa BBQ","Salsa picante",
];

export default function ConfiguracionPage() {
  const supabase = createClient();
  const [activa, setActiva] = useState(true);
  const [texto, setTexto] = useState("");
  const [emoji, setEmoji] = useState("🥗");
  const [deliveryFee, setDeliveryFee] = useState("3000");
  const [localAbierto, setLocalAbierto] = useState(true);
  const [mensajeCerrado, setMensajeCerrado] = useState("Estamos cerrados por el momento. Vuelve pronto 🕐");
  const [whatsappAdmin, setWhatsappAdmin] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("30-45");
  const [horarios, setHorarios] = useState<Horarios>(DEFAULT_HORARIOS);
  const [ingredientes, setIngredientes] = useState<string[]>(DEFAULT_INGREDIENTES);
  const [newIng, setNewIng] = useState("");
  const ingInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("settings")
      .select("*")
      .in("key", [
        "barra_libre_activa","barra_libre_texto","barra_libre_emoji",
        "delivery_fee","local_abierto","mensaje_cerrado","whatsapp_admin",
        "barra_libre_ingredientes","delivery_time","horarios",
      ])
      .then(({ data }) => {
        if (!data) return;
        data.forEach((row) => {
          if (row.key === "barra_libre_activa") setActiva(row.value === "true");
          if (row.key === "barra_libre_texto") setTexto(row.value);
          if (row.key === "barra_libre_emoji") setEmoji(row.value);
          if (row.key === "delivery_fee") setDeliveryFee(row.value);
          if (row.key === "local_abierto") setLocalAbierto(row.value !== "false");
          if (row.key === "mensaje_cerrado") setMensajeCerrado(row.value);
          if (row.key === "whatsapp_admin") setWhatsappAdmin(row.value);
          if (row.key === "delivery_time") setDeliveryTime(row.value);
          if (row.key === "horarios") {
            try { setHorarios(JSON.parse(row.value)); } catch { /* keep default */ }
          }
          if (row.key === "barra_libre_ingredientes") {
            try { setIngredientes(JSON.parse(row.value)); } catch { /* keep default */ }
          }
        });
        setLoading(false);
      });
  }, []);

  function addIngrediente() {
    const val = newIng.trim();
    if (!val) return;
    if (ingredientes.includes(val)) {
      toast.error("Ya existe ese ingrediente");
      return;
    }
    setIngredientes([...ingredientes, val]);
    setNewIng("");
    ingInputRef.current?.focus();
  }

  function removeIngrediente(ing: string) {
    setIngredientes(ingredientes.filter((i) => i !== ing));
  }

  async function save() {
    const fee = Number(deliveryFee);
    if (isNaN(fee) || fee < 0) {
      toast.error("El costo de domicilio no es válido");
      return;
    }
    if (ingredientes.length === 0) {
      toast.error("Agrega al menos un ingrediente de barra libre");
      return;
    }
    setSaving(true);
    const updates = [
      { key: "barra_libre_activa", value: activa ? "true" : "false" },
      { key: "barra_libre_texto", value: texto },
      { key: "barra_libre_emoji", value: emoji },
      { key: "delivery_fee", value: String(fee) },
      { key: "local_abierto", value: localAbierto ? "true" : "false" },
      { key: "mensaje_cerrado", value: mensajeCerrado },
      { key: "whatsapp_admin", value: whatsappAdmin },
      { key: "delivery_time", value: deliveryTime },
      { key: "horarios", value: JSON.stringify(horarios) },
      { key: "barra_libre_ingredientes", value: JSON.stringify(ingredientes) },
    ];
    const { error } = await supabase.from("settings").upsert(updates, { onConflict: "key" });
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
    <div className="max-w-xl space-y-6">
      <h1 className="text-3xl font-black text-[#F5F0E8]">Configuración</h1>

      {/* Estado del local */}
      <div className="bg-[#22232B] border border-[#2E3038] rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Store size={18} className="text-[#D4A017]" />
          <h2 className="text-[#F5F0E8] font-bold text-lg">Estado del local</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#F5F0E8] text-sm font-medium">Local</p>
            <p className="text-[#888899] text-xs mt-0.5">
              {localAbierto ? "Los clientes pueden hacer pedidos" : "Se muestra un mensaje de cerrado en el menú"}
            </p>
          </div>
          <button
            onClick={() => setLocalAbierto(!localAbierto)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              localAbierto
                ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${localAbierto ? "bg-green-400" : "bg-red-400"}`} />
            {localAbierto ? "Abierto" : "Cerrado"}
          </button>
        </div>
        {!localAbierto && (
          <div>
            <label className="block text-[#F5F0E8] text-sm font-medium mb-2">Mensaje para los clientes</label>
            <input
              type="text"
              value={mensajeCerrado}
              onChange={(e) => setMensajeCerrado(e.target.value)}
              maxLength={120}
              className="w-full bg-[#1A1B21] border border-[#2E3038] rounded-lg px-4 py-2.5 text-[#F5F0E8] text-sm focus:outline-none focus:border-[#D4A017] transition-colors"
            />
          </div>
        )}
      </div>

      {/* WhatsApp */}
      <div className="bg-[#22232B] border border-[#2E3038] rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle size={18} className="text-green-400" />
          <h2 className="text-[#F5F0E8] font-bold text-lg">Notificaciones WhatsApp</h2>
        </div>
        <div>
          <label className="block text-[#F5F0E8] text-sm font-medium mb-2">Número del admin</label>
          <div className="flex items-center gap-2">
            <span className="text-[#888899] text-sm font-medium">+</span>
            <input
              type="tel"
              value={whatsappAdmin}
              onChange={(e) => setWhatsappAdmin(e.target.value.replace(/\D/g, ""))}
              className="w-full bg-[#1A1B21] border border-[#2E3038] rounded-lg px-4 py-2.5 text-[#F5F0E8] text-sm focus:outline-none focus:border-[#D4A017] transition-colors"
              placeholder="573001234567"
            />
          </div>
          <p className="text-[#888899] text-xs mt-1">
            Con código de país, sin +. Ej: <span className="text-[#CCCCCC]">573001234567</span>
          </p>
        </div>
      </div>

      {/* Domicilio */}
      <div className="bg-[#22232B] border border-[#2E3038] rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Bike size={18} className="text-[#D4A017]" />
          <h2 className="text-[#F5F0E8] font-bold text-lg">Costo de domicilio</h2>
        </div>
        <div>
          <label className="block text-[#F5F0E8] text-sm font-medium mb-2">Valor (COP)</label>
          <div className="flex items-center gap-2">
            <span className="text-[#888899] text-sm font-medium">$</span>
            <input
              type="number"
              min="0"
              step="100"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              className="w-full bg-[#1A1B21] border border-[#2E3038] rounded-lg px-4 py-2.5 text-[#F5F0E8] text-sm focus:outline-none focus:border-[#D4A017] transition-colors"
              placeholder="3000"
            />
          </div>
          <p className="text-[#888899] text-xs mt-1">
            Se mostrará como <strong className="text-[#CCCCCC]">${Number(deliveryFee || 0).toLocaleString("es-CO")}</strong> en el carrito
          </p>
        </div>
      </div>

      {/* Tiempo estimado de entrega */}
      <div className="bg-[#22232B] border border-[#2E3038] rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-[#D4A017]" />
          <h2 className="text-[#F5F0E8] font-bold text-lg">Tiempo estimado de entrega</h2>
        </div>
        <div>
          <label className="block text-[#F5F0E8] text-sm font-medium mb-2">Tiempo (minutos)</label>
          <input
            type="text"
            value={deliveryTime}
            onChange={(e) => setDeliveryTime(e.target.value)}
            maxLength={20}
            className="w-full bg-[#1A1B21] border border-[#2E3038] rounded-lg px-4 py-2.5 text-[#F5F0E8] text-sm focus:outline-none focus:border-[#D4A017] transition-colors"
            placeholder="30-45"
          />
          <p className="text-[#888899] text-xs mt-1">
            Se mostrará como <strong className="text-[#CCCCCC]">~{deliveryTime} min</strong> en el seguimiento del pedido
          </p>
        </div>
      </div>

      {/* Horarios */}
      <div className="bg-[#22232B] border border-[#2E3038] rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-[#D4A017]" />
          <h2 className="text-[#F5F0E8] font-bold text-lg">Horarios de atención</h2>
        </div>
        <p className="text-[#888899] text-xs">
          Si el local está marcado como <strong className="text-[#CCCCCC]">Abierto</strong>, el sistema revisará estos horarios automáticamente.
        </p>
        <div className="space-y-2">
          {DIAS.map(({ key, label }) => {
            const dia = horarios[key] ?? { active: false, open: "11:00", close: "22:00" };
            return (
              <div key={key} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${dia.active ? "border-[#2E3038] bg-[#1A1B21]" : "border-[#1A1B21] bg-[#111217] opacity-60"}`}>
                <button
                  onClick={() => setHorarios({ ...horarios, [key]: { ...dia, active: !dia.active } })}
                  className={`w-10 h-6 rounded-full transition-colors shrink-0 relative ${dia.active ? "bg-[#D4A017]" : "bg-[#2E3038]"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${dia.active ? "left-5" : "left-1"}`} />
                </button>
                <span className="text-[#CCCCCC] text-sm w-24 shrink-0">{label}</span>
                {dia.active ? (
                  <div className="flex items-center gap-2 flex-1 flex-wrap">
                    <TimePicker12h
                      value={dia.open}
                      onChange={(v) => setHorarios({ ...horarios, [key]: { ...dia, open: v } })}
                    />
                    <span className="text-[#555566] text-xs">→</span>
                    <TimePicker12h
                      value={dia.close}
                      onChange={(v) => setHorarios({ ...horarios, [key]: { ...dia, close: v } })}
                    />
                  </div>
                ) : (
                  <span className="text-[#555566] text-xs">Cerrado</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Barra libre */}
      <div className="bg-[#22232B] border border-[#2E3038] rounded-xl p-6 space-y-6">
        <h2 className="text-[#F5F0E8] font-bold text-lg">Barra de Ensalada Libre</h2>

        {/* Preview banner */}
        <div className={`w-full border rounded-2xl px-4 py-3 flex items-center gap-3 transition-opacity ${
          activa ? "bg-[#2A2414] border-[#D4A017]/30 opacity-100" : "bg-[#1A1B21] border-[#2E3038] opacity-40"
        }`}>
          <span className="text-2xl">{emoji}</span>
          <p className="text-[#E8B830] text-xs font-medium text-left">{texto || "Escribe el mensaje..."}</p>
        </div>

        {/* Toggle banner */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#F5F0E8] text-sm font-medium">Mostrar banner</p>
            <p className="text-[#888899] text-xs mt-0.5">Visible en la página del menú</p>
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

        {/* Texto del banner */}
        <div>
          <label className="block text-[#F5F0E8] text-sm font-medium mb-2">Mensaje del banner</label>
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
          <label className="block text-[#F5F0E8] text-sm font-medium mb-2">Emoji del banner</label>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`text-xl w-10 h-10 rounded-lg transition-all ${
                  emoji === e ? "bg-[#D4A017]/20 ring-2 ring-[#D4A017]" : "bg-[#1A1B21] hover:bg-[#2E3038]"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* ── Ingredientes disponibles ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[#F5F0E8] text-sm font-medium">
              Ingredientes disponibles
            </label>
            <span className="text-[#888899] text-xs">{ingredientes.length} ingrediente{ingredientes.length !== 1 ? "s" : ""}</span>
          </div>
          <p className="text-[#888899] text-xs mb-3">
            Estos son los que aparecen como opciones al editar un producto con barra libre.
          </p>

          {/* Lista de ingredientes actuales */}
          <div className="flex flex-wrap gap-2 mb-3 min-h-[40px]">
            {ingredientes.map((ing) => (
              <span
                key={ing}
                className="flex items-center gap-1.5 bg-[#D4A017]/15 text-[#D4A017] border border-[#D4A017]/30 text-xs px-3 py-1 rounded-full font-medium"
              >
                {ing}
                <button
                  onClick={() => removeIngrediente(ing)}
                  className="text-[#D4A017]/60 hover:text-red-400 transition-colors ml-0.5"
                  title="Eliminar"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {ingredientes.length === 0 && (
              <p className="text-[#555566] text-xs italic">Sin ingredientes</p>
            )}
          </div>

          {/* Input para agregar */}
          <div className="flex gap-2">
            <input
              ref={ingInputRef}
              type="text"
              value={newIng}
              onChange={(e) => setNewIng(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addIngrediente(); } }}
              placeholder="Nuevo ingrediente..."
              maxLength={40}
              className="flex-1 bg-[#1A1B21] border border-[#2E3038] rounded-lg px-4 py-2.5 text-[#F5F0E8] text-sm focus:outline-none focus:border-[#D4A017] transition-colors"
            />
            <button
              onClick={addIngrediente}
              disabled={!newIng.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#D4A017] text-[#111217] font-bold text-sm rounded-lg hover:bg-[#E8B830] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={15} />
              Agregar
            </button>
          </div>
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
  );
}
