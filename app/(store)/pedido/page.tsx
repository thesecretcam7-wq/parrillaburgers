"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store/cart";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import Link from "next/link";
import { User, CheckCircle, CreditCard, Banknote, Star, Tag, X, MapPin, Clock } from "lucide-react";
import { BrandEmoji } from "@/components/ui/BrandEmoji";
import { Coupon } from "@/lib/types";
import { useStoreStatus } from "@/lib/hooks/useStoreStatus";

type DeliveryZone = { id: string; name: string; price: number };

const STORAGE_KEY = "pb-customer";
// 100 puntos = $1.000 de descuento
const POINTS_PER_DISCOUNT = 100;
const DISCOUNT_PER_BLOCK = 1000;

type FormData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
};

export default function OrderPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [returning, setReturning] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"wompi" | "cash">("wompi");
  const [customerPoints, setCustomerPoints] = useState(0);
  const [usePoints, setUsePoints] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [delivery, setDelivery] = useState(3000);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [pedidosPausados, setPedidosPausados] = useState(false);
  const [mesaNum, setMesaNum] = useState<string | null>(null);
  const { isOpen, mensajeCerrado } = useStoreStatus();
  const [form, setForm] = useState<FormData>({
    name: "", email: "", phone: "", address: "", notes: "",
  });

  useEffect(() => {
    const client = createClient();
    client.from("settings").select("value").eq("key", "delivery_fee").single()
      .then(({ data }) => { if (data) setDelivery(Number(data.value)); });
    client.from("delivery_zones").select("id, name, price").eq("active", true).order("name")
      .then(({ data }) => { if (data && data.length > 0) setZones(data as DeliveryZone[]); });
    client.from("settings").select("value").eq("key", "pedidos_pausados").single()
      .then(({ data }) => { if (data?.value === "true") setPedidosPausados(true); });
    try {
      const mesa = localStorage.getItem("pb-mesa");
      if (mesa) setMesaNum(mesa);
    } catch { /* ignore */ }
  }, []);

  // Pre-fill form with saved customer data
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved) as Partial<FormData>;
        setForm((prev) => ({
          ...prev,
          name: data.name ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          address: data.address ?? "",
        }));
        setReturning(true);
      }
    } catch { /* ignore */ }
  }, []);

  // Fetch customer points when email is known
  useEffect(() => {
    if (!form.email) { setCustomerPoints(0); return; }
    createClient()
      .from("customers").select("points").eq("email", form.email).single()
      .then(({ data }) => { setCustomerPoints(data?.points ?? 0); });
  }, [form.email]);

  const subtotal = total();
  const effectiveDelivery = mesaNum ? 0 : (selectedZone ? selectedZone.price : delivery);
  // Points discount
  const maxDiscount = Math.min(
    Math.floor(customerPoints / POINTS_PER_DISCOUNT) * DISCOUNT_PER_BLOCK,
    subtotal
  );
  const pointsDiscount = usePoints ? maxDiscount : 0;
  const pointsUsed = usePoints ? Math.ceil(pointsDiscount / DISCOUNT_PER_BLOCK) * POINTS_PER_DISCOUNT : 0;
  // Coupon discount
  const couponDiscount = coupon
    ? coupon.type === "percent"
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value
    : 0;
  const grandTotal = Math.max(subtotal + effectiveDelivery - pointsDiscount - couponDiscount, effectiveDelivery);
  const pointsEarned = Math.floor(grandTotal / 1000);

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    try {
      const { data, error } = await createClient()
        .from("coupons")
        .select("*")
        .eq("code", code)
        .eq("active", true)
        .single();
      if (error || !data) { toast.error("Cupón no válido"); return; }
      if (data.expires_at && new Date(data.expires_at) < new Date()) { toast.error("El cupón ha expirado"); return; }
      if (data.max_uses !== null && data.uses_count >= data.max_uses) { toast.error("El cupón ya no tiene usos disponibles"); return; }
      if (subtotal < data.min_order) { toast.error(`El pedido mínimo para este cupón es $${data.min_order.toLocaleString("es-CO")}`); return; }
      setCoupon(data as Coupon);
      toast.success("¡Cupón aplicado!");
    } catch {
      toast.error("Error al verificar el cupón");
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#0F1117] flex flex-col items-center justify-center px-4">
        <p className="text-[#9CA3AF] mb-4 text-sm">No tienes productos en tu carrito</p>
        <Link href="/" className="text-[#D4A017] font-semibold hover:underline">Ver Menú</Link>
      </main>
    );
  }

  if (pedidosPausados) {
    return (
      <main className="min-h-screen bg-[#0F1117] flex flex-col items-center justify-center px-4 text-center">
        <div className="text-6xl mb-4">⏸️</div>
        <p className="text-white font-black text-xl mb-2">Pedidos pausados</p>
        <p className="text-[#9CA3AF] text-sm mb-6 max-w-xs">
          En este momento no estamos recibiendo pedidos. Vuelve en unos minutos.
        </p>
        <Link href="/menu" className="bg-[#D4A017] text-[#0F1117] font-bold px-6 py-3 rounded-xl text-sm">
          Ver Menú
        </Link>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOpen === false) {
      toast.error("El local está cerrado, no se pueden hacer pedidos ahora");
      return;
    }
    if (!form.name || !form.email || !form.phone || (!mesaNum && !form.address)) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }
    if (!mesaNum && zones.length > 0 && !selectedZone) {
      toast.error("Selecciona tu barrio / zona de entrega");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      const { data: customer } = await supabase
        .from("customers")
        .upsert(
          { email: form.email, name: form.name, phone: form.phone, address: form.address },
          { onConflict: "email" }
        )
        .select()
        .single();

      const orderNumber = `PB-${Date.now().toString().slice(-6)}`;

      const orderItems = items.map((ci) => ({
        menu_item_id: ci.item.id,
        menu_item_name: ci.item.name,
        quantity: ci.quantity,
        unit_price: ci.item.price,
        subtotal: ci.item.price * ci.quantity,
        barra_libre_selected: ci.barra_libre_selected ?? [],
      }));

      const clearMesa = () => { try { localStorage.removeItem("pb-mesa"); } catch { /* ignore */ } };

      // ====== WOMPI PAYMENT FLOW ======
      if (paymentMethod === "wompi") {
        // Store order data in localStorage temporarily (don't create in DB yet)
        const pendingOrderData = {
          orderNumber,
          customer_id: customer?.id ?? null,
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          delivery_address: mesaNum ? `Mesa ${mesaNum}` : form.address,
          notes: form.notes || null,
          items: orderItems,
          subtotal,
          delivery_fee: effectiveDelivery,
          total: grandTotal,
          points_earned: pointsEarned,
          coupon_code: coupon?.code ?? null,
          coupon_discount: couponDiscount || null,
          mesa_number: mesaNum ?? null,
          pointsUsed,
        };

        localStorage.setItem("pb-pending-wompi-order", JSON.stringify(pendingOrderData));
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: form.name, email: form.email, phone: form.phone, address: form.address }));

        // Generate Wompi signature and redirect
        const amountInCents = grandTotal * 100;
        const sigRes = await fetch("/api/wompi/signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: orderNumber, amountInCents, currency: "COP" }),
        });
        const { signature } = await sigRes.json();
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${window.location.protocol}//${window.location.host}`;
        const wompiUrl = new URL("https://checkout.wompi.co/p/");
        wompiUrl.searchParams.set("public-key", process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || "");
        wompiUrl.searchParams.set("currency", "COP");
        wompiUrl.searchParams.set("amount-in-cents", String(amountInCents));
        wompiUrl.searchParams.set("reference", orderNumber);
        wompiUrl.searchParams.set("signature:integrity", signature);
        wompiUrl.searchParams.set("redirect-url", `${appUrl}/seguimiento?order=${orderNumber}`);
        wompiUrl.searchParams.set("customer-data:email", form.email);
        wompiUrl.searchParams.set("customer-data:full-name", "Parrilla Burgers");
        wompiUrl.searchParams.set("customer-data:phone-number", form.phone);
        wompiUrl.searchParams.set("customer-data:phone-number-prefix", "+57");

        // IMPORTANT: Don't clear cart yet - user might press back and return to cart
        clearMesa();
        window.location.href = wompiUrl.toString();
        return;
      }

      // ====== CASH / CONTRAENTREGA FLOW (create order immediately) ======
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_id: customer?.id ?? null,
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          delivery_address: mesaNum ? `Mesa ${mesaNum}` : form.address,
          notes: form.notes || null,
          items: orderItems,
          subtotal,
          delivery_fee: effectiveDelivery,
          total: grandTotal,
          status: "pending",
          payment_status: "pending",
          points_earned: pointsEarned,
          wompi_transaction_id: mesaNum ? "PAGAR_EN_CAJA" : "CONTRA_ENTREGA",
          coupon_code: coupon?.code ?? null,
          coupon_discount: couponDiscount || null,
          mesa_number: mesaNum ?? null,
        })
        .select()
        .single();

      if (error) throw error;

      // Deduct used points and add earned points
      if (customer?.id) {
        const newPoints = customerPoints - pointsUsed + pointsEarned;
        await supabase.from("customers").update({ points: newPoints }).eq("id", customer.id);
      }

      // Increment coupon uses_count
      if (coupon) {
        await supabase.from("coupons").update({ uses_count: coupon.uses_count + 1 }).eq("id", coupon.id);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: form.name, email: form.email, phone: form.phone, address: form.address }));
      localStorage.setItem("pb-last-order", orderNumber);

      clearCart();
      clearMesa();
      toast.success(mesaNum ? `¡Pedido ${orderNumber} creado! Paga en caja cuando termines.` : `¡Pedido ${orderNumber} creado! Pagarás al recibir.`);
      router.push(`/seguimiento?order=${orderNumber}`);
    } catch (err) {
      console.error(err);
      toast.error("Error al crear el pedido. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-[#22242C] border border-[#2E3038] rounded-xl px-4 py-3 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#D4A017] transition-colors text-sm";

  return (
    <main className="min-h-screen bg-[#0F1117] px-4 py-4 pb-24">
      <div className="max-w-lg mx-auto space-y-3">
        <div className="bg-[#1A1B21] rounded-2xl p-5 border border-[#2E3038]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold flex items-center gap-2">
              <User size={18} className="text-[#D4A017]" />
              Tus datos
            </h2>
            {returning && (
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem(STORAGE_KEY);
                  setForm({ name: "", email: "", phone: "", address: "", notes: "" });
                  setReturning(false);
                  setCustomerPoints(0);
                  setUsePoints(false);
                }}
                className="text-[#6B7280] text-xs hover:text-[#9CA3AF] transition-colors"
              >
                Cambiar datos
              </button>
            )}
          </div>

          {returning && (
            <div className="mb-4 bg-[#1E2A1A] border border-green-800/30 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <CheckCircle size={14} className="text-green-400 shrink-0" />
              <p className="text-green-400 text-xs font-medium">
                ¡Bienvenido de vuelta, <strong>{form.name.split(" ")[0]}</strong>! Tus datos están listos.
              </p>
            </div>
          )}

          {/* Mesa badge */}
          {mesaNum && (
            <div className="mb-4 bg-[#2A2414] border border-[#D4A017]/40 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <span className="text-lg">🪑</span>
              <p className="text-[#D4A017] font-bold text-sm">Mesa {mesaNum} — pedido en el establecimiento</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[#9CA3AF] text-xs mb-1.5 block font-medium">Nombre completo *</label>
                <input className={inputClass} placeholder="Tu nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="text-[#9CA3AF] text-xs mb-1.5 block font-medium">Email *</label>
                <input className={inputClass} type="email" placeholder="tu@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <label className="text-[#9CA3AF] text-xs mb-1.5 block font-medium">Teléfono *</label>
                <input className={inputClass} placeholder="300 000 0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              </div>
              {!mesaNum && (
                <div>
                  <label className="text-[#9CA3AF] text-xs mb-1.5 block font-medium">Dirección de entrega *</label>
                  <input className={inputClass} placeholder="Calle, barrio, ciudad" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
                </div>
              )}
            </div>
            {/* Selector de zona — obligatorio si hay zonas configuradas y no es mesa */}
            {!mesaNum && zones.length > 0 && (
              <div>
                <label className="text-[#9CA3AF] text-xs mb-2 block font-medium flex items-center gap-1">
                  <MapPin size={12} /> Barrio / Zona de entrega *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {zones.map((z) => (
                    <button
                      key={z.id}
                      type="button"
                      onClick={() => setSelectedZone(z)}
                      className={`text-left px-3 py-2.5 rounded-xl border text-sm transition-all ${
                        selectedZone?.id === z.id
                          ? "bg-[#D4A017]/10 border-[#D4A017] text-[#D4A017]"
                          : "border-[#2E3038] text-[#9CA3AF] hover:border-[#D4A017]/40"
                      }`}
                    >
                      <p className="font-semibold truncate">{z.name}</p>
                      <p className="text-xs opacity-70">${z.price.toLocaleString("es-CO")}</p>
                    </button>
                  ))}
                </div>
                {!selectedZone && (
                  <p className="text-red-400/80 text-xs mt-1.5 flex items-center gap-1">
                    <MapPin size={11} /> Selecciona tu barrio para continuar
                  </p>
                )}
                <div className="mt-3 bg-[#1A1B21] border border-[#2E3038] rounded-xl px-4 py-3">
                  <p className="text-[#6B7280] text-xs font-medium mb-1">¿No ves tu barrio?</p>
                  <p className="text-[#555566] text-xs">
                    Por el momento solo hacemos domicilio a los barrios listados. Contáctanos por WhatsApp si quieres más información.
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="text-[#9CA3AF] text-xs mb-1.5 block font-medium">Notas (opcional)</label>
              <textarea className={`${inputClass} resize-none h-20`} placeholder="Sin cebolla, extra queso, indicaciones de entrega..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <p className="text-[#6B7280] text-xs">Al continuar, crearemos una cuenta para acumular puntos y rastrear tus pedidos.</p>

            {/* Order summary */}
            <div className="bg-[#22242C] rounded-xl p-4 space-y-2 text-sm">
              {items.map(({ item, quantity }) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-[#9CA3AF]">{item.name} <span className="text-[#6B7280]">x{quantity}</span></span>
                  <span className="text-white font-medium">${(item.price * quantity).toLocaleString("es-CO")}</span>
                </div>
              ))}
              <div className="flex justify-between text-[#9CA3AF] pt-1 border-t border-[#2E3038]">
                {mesaNum ? (
                  <>
                    <span>Mesa {mesaNum}</span>
                    <span className="text-green-400">Gratis</span>
                  </>
                ) : (
                  <>
                    <span>Domicilio{selectedZone ? ` · ${selectedZone.name}` : ""}</span>
                    <span>${effectiveDelivery.toLocaleString("es-CO")}</span>
                  </>
                )}
              </div>
              {pointsDiscount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Descuento puntos ({pointsUsed} pts)</span>
                  <span>-${pointsDiscount.toLocaleString("es-CO")}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Cupón {coupon?.code}</span>
                  <span>-${couponDiscount.toLocaleString("es-CO")}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-1 border-t border-[#2E3038]">
                <span className="text-white">Total</span>
                <span className="text-[#D4A017]">${grandTotal.toLocaleString("es-CO")}</span>
              </div>
            </div>

            {/* Cupón de descuento */}
            <div>
              <label className="text-[#9CA3AF] text-xs mb-2 flex items-center gap-1.5 font-medium"><BrandEmoji name="coupon" size={18} /> Cupón de descuento</label>
              {coupon ? (
                <div className="flex items-center justify-between bg-green-900/20 border border-green-800/40 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Tag size={15} className="text-green-400" />
                    <div>
                      <p className="text-green-400 text-sm font-bold">{coupon.code}</p>
                      <p className="text-green-400/70 text-xs">
                        {coupon.type === "percent" ? `${coupon.value}% de descuento` : `-$${coupon.value.toLocaleString("es-CO")}`}
                      </p>
                    </div>
                  </div>
                  <button type="button" onClick={() => { setCoupon(null); setCouponInput(""); }} className="text-green-400/60 hover:text-red-400 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    className={`${inputClass} flex-1 uppercase`}
                    placeholder="CÓDIGO"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyCoupon(); } }}
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-4 py-2 bg-[#22242C] border border-[#2E3038] text-[#9CA3AF] hover:border-[#D4A017] hover:text-[#D4A017] rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                  >
                    {couponLoading ? "..." : "Aplicar"}
                  </button>
                </div>
              )}
            </div>

            {/* Points redemption — solo si tiene >= 100 puntos */}
            {customerPoints >= POINTS_PER_DISCOUNT && (
              <button
                type="button"
                onClick={() => setUsePoints(!usePoints)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                  usePoints
                    ? "bg-[#D4A017]/10 border-[#D4A017]"
                    : "bg-[#22242C] border-[#2E3038] hover:border-[#D4A017]/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Star size={16} className={usePoints ? "text-[#D4A017]" : "text-[#6B7280]"} />
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${usePoints ? "text-[#D4A017]" : "text-[#9CA3AF]"}`}>
                      Usar mis puntos
                    </p>
                    <p className="text-[#6B7280] text-xs">
                      {customerPoints} puntos = -${maxDiscount.toLocaleString("es-CO")} de descuento
                    </p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  usePoints ? "border-[#D4A017] bg-[#D4A017]" : "border-[#2E3038]"
                }`}>
                  {usePoints && <CheckCircle size={12} className="text-[#0F1117]" />}
                </div>
              </button>
            )}

            {/* Points earned strip */}
            <div className="bg-[#2A2414] rounded-xl px-4 py-2.5 flex items-center gap-2">
              <BrandEmoji name="burger" size={28} />
              <p className="text-[#E8B830] text-xs font-medium">
                Ganarás <strong>{pointsEarned} puntos</strong> con este pedido
              </p>
            </div>

            {/* Método de pago */}
            <div>
              <label className="text-[#9CA3AF] text-xs mb-2 block font-medium">Método de pago</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("wompi")}
                  className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-semibold transition-all ${
                    paymentMethod === "wompi"
                      ? "bg-[#D4A017]/10 border-[#D4A017] text-[#D4A017]"
                      : "border-[#2E3038] text-[#6B7280] hover:border-[#D4A017]/40"
                  }`}
                >
                  <CreditCard size={16} />
                  Pagar en línea
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-semibold transition-all ${
                    paymentMethod === "cash"
                      ? "bg-[#D4A017]/10 border-[#D4A017] text-[#D4A017]"
                      : "border-[#2E3038] text-[#6B7280] hover:border-[#D4A017]/40"
                  }`}
                >
                  <Banknote size={16} />
                  {mesaNum ? "Pagar en caja" : "Contra entrega"}
                </button>
              </div>
            </div>

            {isOpen === false ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-4 flex items-start gap-3">
                <Clock size={18} className="text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-red-400 font-bold text-sm">Local cerrado</p>
                  <p className="text-red-300/70 text-xs mt-0.5">{mensajeCerrado}</p>
                </div>
              </div>
            ) : (
              <button
                type="submit"
                disabled={loading || isOpen === null}
                className="w-full bg-[#D4A017] disabled:opacity-50 disabled:cursor-not-allowed text-[#0F1117] font-bold py-4 rounded-xl text-base"
              >
                {loading
                  ? "Procesando..."
                  : paymentMethod === "cash"
                  ? (mesaNum ? "Pagar en caja" : "Pedir y pagar al recibir")
                  : `Pagar $${grandTotal.toLocaleString("es-CO")} con Wompi`}
              </button>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
