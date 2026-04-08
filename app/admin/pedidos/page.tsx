"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Order, OrderStatus } from "@/lib/types";
import toast from "react-hot-toast";
import { ShoppingBag, PauseCircle, PlayCircle, Bell, BellOff } from "lucide-react";
import { PrintReceiptButton } from "@/components/admin/PrintReceiptButton";

const WA_MESSAGES: Partial<Record<OrderStatus, string>> = {
  confirmed:  "✅ Tu pedido {number} fue *confirmado*. ¡Lo estamos preparando! 🍔",
  preparing:  "👨‍🍳 Tu pedido {number} está siendo *preparado*. Ya casi está listo.",
  on_the_way: "🛵 ¡Tu pedido {number} está *en camino*! Prepárate para recibirlo.",
  delivered:  "🎉 Tu pedido {number} fue *entregado*. ¡Que lo disfrutes! Gracias por elegirnos.",
  cancelled:  "❌ Tu pedido {number} fue *cancelado*. Contáctanos si tienes dudas.",
};

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending",    label: "Pendiente" },
  { value: "confirmed",  label: "Confirmado" },
  { value: "preparing",  label: "Preparando" },
  { value: "on_the_way", label: "En camino" },
  { value: "delivered",  label: "Entregado" },
  { value: "cancelled",  label: "Cancelado" },
];

const statusColors: Record<string, string> = {
  pending:    "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  confirmed:  "bg-blue-500/20 text-blue-400 border-blue-500/30",
  preparing:  "bg-orange-500/20 text-orange-400 border-orange-500/30",
  on_the_way: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  delivered:  "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled:  "bg-red-500/20 text-red-400 border-red-500/30",
};

/** Genera un sonido de notificación con Web Audio API */
function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    // Reanudar contexto si estaba suspendido (política de autoplay del navegador)
    const play = () => {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // Do-Mi-Sol-Do
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        const start = ctx.currentTime + i * 0.14;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.5, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
        osc.start(start);
        osc.stop(start + 0.35);
      });
    };
    if (ctx.state === "suspended") {
      ctx.resume().then(play);
    } else {
      play();
    }
  } catch { /* contexto de audio no disponible */ }
}

/** Solicita permiso y lanza notificación del sistema operativo */
async function showOSNotification(title: string, body: string) {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/logo-real.png",
      badge: "/logo-real.png",
      tag: "nuevo-pedido",
      requireInteraction: true, // no desaparece sola
    });
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [whatsappAdmin, setWhatsappAdmin] = useState("");
  const [pausado, setPausado] = useState(false);
  const [pausadoLoading, setPausadoLoading] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");

  // IDs conocidos — ref para no re-ejecutar el efecto
  const knownIds  = useRef<Set<string>>(new Set());
  const firstLoad = useRef(true);
  const whatsappRef = useRef("");

  useEffect(() => {
    if ("Notification" in window) setNotifPermission(Notification.permission);
    const client = createClient();
    client.from("settings").select("value").eq("key", "whatsapp_admin").single()
      .then(({ data }) => {
        if (data?.value) { setWhatsappAdmin(data.value); whatsappRef.current = data.value; }
      });
    client.from("settings").select("value").eq("key", "pedidos_pausados").single()
      .then(({ data }) => { if (data) setPausado(data.value === "true"); });
  }, []);

  const enableNotifications = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setNotifPermission(result);
    if (result === "granted") {
      playNotificationSound();
      new Notification("✅ Notificaciones activadas", { body: "Recibirás alertas de nuevos pedidos.", icon: "/logo-real.png" });
    }
  };

  const togglePausado = async () => {
    setPausadoLoading(true);
    const newVal = !pausado;
    const client = createClient();
    await client.from("settings").upsert({ key: "pedidos_pausados", value: String(newVal) }, { onConflict: "key" });
    setPausado(newVal);
    setPausadoLoading(false);
    toast.success(newVal ? "Pedidos pausados — no se aceptarán nuevos pedidos" : "Pedidos reactivados ✅");
  };

  useEffect(() => {
    const supabase = createClient();

    const fetchOrders = async () => {
      const q = supabase.from("orders").select("*").order("created_at", { ascending: false });
      const { data } = filter === "all"
        ? await q.neq("status", "delivered").neq("status", "cancelled")
        : await q.eq("status", filter);

      const incoming: Order[] = data ?? [];

      // Detectar pedidos nuevos (solo después de la primera carga)
      if (!firstLoad.current) {
        const newOrders = incoming.filter((o) => !knownIds.current.has(o.id));
        newOrders.forEach((o) => {
          playNotificationSound();
          showOSNotification(
            `🛎️ Nuevo pedido ${o.order_number}`,
            `${o.customer_name} · $${(o.total ?? 0).toLocaleString("es-CO")}`
          );
          const waNumber = whatsappRef.current;
          const waText = encodeURIComponent(
            `🛎️ Nuevo pedido ${o.order_number}\n👤 ${o.customer_name}\n📍 ${o.delivery_address}\n💰 $${(o.total ?? 0).toLocaleString("es-CO")}`
          );
          toast.custom(
            (t) => (
              <div
                className={`flex items-start gap-3 bg-[#1A1B21] border border-[#D4A017] rounded-2xl px-4 py-3 shadow-lg ${
                  t.visible ? "animate-enter" : "animate-leave"
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-[#D4A017]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <ShoppingBag size={18} className="text-[#D4A017]" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">¡Nuevo pedido!</p>
                  <p className="text-[#CCCCCC] text-xs mb-2">{o.customer_name} · ${o.total?.toLocaleString("es-CO")}</p>
                  {waNumber && (
                    <a
                      href={`https://wa.me/${waNumber}?text=${waText}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.122 1.524 5.855L.057 23.882l6.179-1.448A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.372l-.36-.213-3.668.86.875-3.581-.234-.369A9.818 9.818 0 1112 21.818z"/></svg>
                      WhatsApp
                    </a>
                  )}
                </div>
                <button onClick={() => toast.dismiss(t.id)} className="text-[#6B7280] hover:text-white text-lg leading-none mt-0.5">×</button>
              </div>
            ),
            { duration: 12000, position: "top-right" }
          );
        });
      }

      // Actualizar IDs conocidos
      incoming.forEach((o) => knownIds.current.add(o.id));
      firstLoad.current = false;

      setOrders(incoming);
      setLoading(false);
    };

    fetchOrders();

    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, fetchOrders)
      .subscribe();

    const interval = setInterval(fetchOrders, 5_000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [filter]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId);
    if (error) { console.error("Error updating order:", error); return; }

    const order = orders.find((o) => o.id === orderId);
    if (status === "delivered" || status === "cancelled") {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setExpanded(null);
    } else {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
    }

    // Notificación WhatsApp al cliente
    const waMsg = WA_MESSAGES[status];
    if (order && waMsg) {
      const phone = order.customer_phone.replace(/\D/g, "");
      const fullPhone = phone.startsWith("57") ? phone : `57${phone}`;
      const text = encodeURIComponent(waMsg.replace("{number}", order.order_number));
      const waUrl = `https://wa.me/${fullPhone}?text=${text}`;
      toast.custom(
        (t) => (
          <div className={`flex items-center gap-3 bg-[#1A1B21] border border-[#2E3038] rounded-2xl px-4 py-3 shadow-lg ${t.visible ? "animate-enter" : "animate-leave"}`}>
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">Estado actualizado</p>
              <p className="text-[#888899] text-xs">{STATUS_OPTIONS.find(s => s.value === status)?.label} · {order.customer_name}</p>
            </div>
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => toast.dismiss(t.id)}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors shrink-0"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.122 1.524 5.855L.057 23.882l6.179-1.448A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.372l-.36-.213-3.668.86.875-3.581-.234-.369A9.818 9.818 0 1112 21.818z"/></svg>
              Avisar cliente
            </a>
            <button onClick={() => toast.dismiss(t.id)} className="text-[#555566] hover:text-white text-lg leading-none">×</button>
          </div>
        ),
        { duration: 10000, position: "top-right" }
      );
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <h1 className="text-3xl font-black text-[#F5F0E8]">Pedidos</h1>
        <button
          onClick={togglePausado}
          disabled={pausadoLoading}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
            pausado
              ? "bg-red-500/15 border-red-500/40 text-red-400 hover:bg-red-500/25"
              : "bg-[#1A1B21] border-[#2E3038] text-[#CCCCCC] hover:border-[#D4A017] hover:text-[#D4A017]"
          }`}
        >
          {pausado
            ? <><PlayCircle size={16} /> Reactivar pedidos</>
            : <><PauseCircle size={16} /> Pausar pedidos</>
          }
        </button>
      </div>

      {/* Banner activar notificaciones */}
      {notifPermission !== "granted" && (
        <div className={`mb-4 rounded-xl px-4 py-3 flex items-center gap-3 border ${
          notifPermission === "denied"
            ? "bg-red-500/10 border-red-500/30"
            : "bg-[#D4A017]/10 border-[#D4A017]/30"
        }`}>
          {notifPermission === "denied" ? (
            <BellOff size={18} className="text-red-400 shrink-0" />
          ) : (
            <Bell size={18} className="text-[#D4A017] shrink-0" />
          )}
          <p className={`text-sm flex-1 ${notifPermission === "denied" ? "text-red-300" : "text-[#D4A017]"}`}>
            {notifPermission === "denied"
              ? "Notificaciones bloqueadas. Actívalas en la configuración del navegador (🔒 junto a la URL)."
              : "Activa las notificaciones para recibir alertas de nuevos pedidos aunque estés en otra pestaña."}
          </p>
          {notifPermission !== "denied" && (
            <button
              onClick={enableNotifications}
              className="shrink-0 bg-[#D4A017] hover:bg-[#E8B830] text-[#111217] font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
            >
              Activar
            </button>
          )}
        </div>
      )}

      {pausado && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
          <PauseCircle size={18} className="text-red-400 shrink-0" />
          <p className="text-red-300 text-sm font-medium">Los pedidos están pausados. Los clientes no pueden hacer nuevos pedidos ahora.</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
            filter === "all"
              ? "bg-[#D4A017] text-[#111217] border-[#D4A017]"
              : "border-[#2E3038] text-[#CCCCCC] hover:border-[#D4A017]"
          }`}
        >
          Activos
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              filter === s.value
                ? "bg-[#D4A017] text-[#111217] border-[#D4A017]"
                : "border-[#2E3038] text-[#CCCCCC] hover:border-[#D4A017]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-[#888899] text-center py-12">Cargando pedidos...</p>
      ) : orders.length === 0 ? (
        <p className="text-[#888899] text-center py-12">No hay pedidos</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-[#22232B] border border-[#2E3038] rounded-xl overflow-hidden">
              {/* Header row */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#1A1B21] transition-colors gap-3"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[#D4A017] font-mono font-bold text-xs shrink-0">{order.order_number}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border shrink-0 ${statusColors[order.status]}`}>
                      {STATUS_OPTIONS.find((s) => s.value === order.status)?.label}
                    </span>
                    {(order.mesa_number || order.delivery_address?.startsWith("Mesa ")) && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 bg-[#D4A017]/15 text-[#D4A017] border-[#D4A017]/30">
                        🪑 {order.mesa_number ? `Mesa ${order.mesa_number}` : order.delivery_address}
                      </span>
                    )}
                  </div>
                  <span className="text-[#CCCCCC] text-sm font-medium truncate mt-0.5">{order.customer_name}</span>
                  <span className="text-[#888899] text-xs truncate">{order.customer_phone}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[#F5F0E8] font-bold text-sm">${order.total?.toLocaleString("es-CO")}</span>
                </div>
              </div>

              {/* Expanded */}
              {expanded === order.id && (
                <div className="border-t border-[#2E3038] p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-[#888899] text-xs mb-1">Dirección</p>
                      <p className="text-[#CCCCCC]">{order.delivery_address}</p>
                    </div>
                    <div>
                      <p className="text-[#888899] text-xs mb-1">Email</p>
                      <p className="text-[#CCCCCC] break-all">{order.customer_email}</p>
                    </div>
                    <div>
                      <p className="text-[#888899] text-xs mb-1">Pago</p>
                      {order.wompi_transaction_id === "PAGAR_EN_CAJA" ? (
                        <span className="inline-flex items-center gap-1 bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/20 text-xs font-semibold px-2 py-0.5 rounded-full">
                          🪑 Pagar en caja
                        </span>
                      ) : order.wompi_transaction_id === "CONTRA_ENTREGA" ? (
                        <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-semibold px-2 py-0.5 rounded-full">
                          💵 Contra entrega
                        </span>
                      ) : order.payment_status === "paid" ? (
                        <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold px-2 py-0.5 rounded-full">
                          ✓ Pagado en línea
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs font-semibold px-2 py-0.5 rounded-full">
                          ⏳ Pago pendiente
                        </span>
                      )}
                    </div>
                    {order.notes && (
                      <div className="col-span-2">
                        <p className="text-[#888899] text-xs mb-1">Notas</p>
                        <p className="text-[#CCCCCC]">{order.notes}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-[#888899] text-xs mb-2">Productos</p>
                    {(order.items as any[])?.map((item, i) => (
                      <div key={i} className="mb-2">
                        <div className="flex justify-between text-sm text-[#CCCCCC]">
                          <span>{item.menu_item_name} x{item.quantity}</span>
                          <span>${item.subtotal?.toLocaleString("es-CO")}</span>
                        </div>
                        {item.barra_libre_selected?.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.barra_libre_selected.map((opt: string, j: number) => (
                              <span key={j} className="px-2 py-0.5 rounded-full text-xs bg-[#D4A017]/15 text-[#D4A017] border border-[#D4A017]/25">
                                {opt}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <PrintReceiptButton order={order} />
                  </div>

                  <div>
                    <p className="text-[#888899] text-xs mb-2">Actualizar estado</p>
                    <div className="flex gap-2 flex-wrap">
                      {STATUS_OPTIONS.map((s) => (
                        <button
                          key={s.value}
                          onClick={() => updateStatus(order.id, s.value)}
                          disabled={order.status === s.value}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                            order.status === s.value
                              ? "bg-[#D4A017] text-[#111217] border-[#D4A017]"
                              : "border-[#2E3038] text-[#CCCCCC] hover:border-[#D4A017] hover:text-[#D4A017]"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
