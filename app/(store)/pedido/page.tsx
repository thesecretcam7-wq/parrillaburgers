"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store/cart";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import Link from "next/link";
import { User, CheckCircle } from "lucide-react";

const STORAGE_KEY = "pb-customer";

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
  const [returning, setReturning] = useState(false); // true when data was pre-filled
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  // Pre-fill form with saved customer data on mount
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
    } catch {
      // Ignore parse errors
    }
  }, []);

  const subtotal = total();
  const delivery = 3000;
  const grandTotal = subtotal + delivery;

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#0F1117] flex flex-col items-center justify-center px-4">
        <p className="text-[#9CA3AF] mb-4 text-sm">No tienes productos en tu carrito</p>
        <Link href="/" className="text-[#D4A017] font-semibold hover:underline">
          Ver Menú
        </Link>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.address) {
      toast.error("Por favor completa todos los campos obligatorios");
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

      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_id: customer?.id ?? null,
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          delivery_address: form.address,
          notes: form.notes || null,
          items: orderItems,
          subtotal,
          delivery_fee: delivery,
          total: grandTotal,
          status: "pending",
          payment_status: "pending",
          points_earned: Math.floor(grandTotal / 1000),
        })
        .select()
        .single();

      if (error) throw error;

      // Persist customer data for future orders
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ name: form.name, email: form.email, phone: form.phone, address: form.address })
      );
      // Save last order number so tracking page can show it automatically
      localStorage.setItem("pb-last-order", orderNumber);

      const wompiKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;
      if (wompiKey && !wompiKey.includes("PEGAR") && order) {
        const amountInCents = grandTotal * 100;

        // Generate integrity signature server-side (keeps WOMPI_INTEGRITY_KEY secret)
        const sigRes = await fetch("/api/wompi/signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference: order.order_number,
            amountInCents,
            currency: "COP",
          }),
        });
        const { signature } = await sigRes.json();

        const appUrl =
          process.env.NEXT_PUBLIC_APP_URL ||
          `${window.location.protocol}//${window.location.host}`;

        const wompiUrl = new URL("https://checkout.wompi.co/p/");
        wompiUrl.searchParams.set("public-key", wompiKey);
        wompiUrl.searchParams.set("currency", "COP");
        wompiUrl.searchParams.set("amount-in-cents", String(amountInCents));
        wompiUrl.searchParams.set("reference", order.order_number);
        wompiUrl.searchParams.set("signature:integrity", signature);
        wompiUrl.searchParams.set(
          "redirect-url",
          `${appUrl}/seguimiento?order=${order.order_number}`
        );
        // Pre-fill customer data so they don't have to re-enter it
        wompiUrl.searchParams.set("customer-data:email", form.email);
        wompiUrl.searchParams.set("customer-data:full-name", form.name);
        wompiUrl.searchParams.set("customer-data:phone-number", form.phone);
        wompiUrl.searchParams.set("customer-data:phone-number-prefix", "+57");
        clearCart();
        window.location.href = wompiUrl.toString();
      } else {
        clearCart();
        toast.success(`¡Pedido ${orderNumber} creado!`);
        router.push(`/seguimiento?order=${orderNumber}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al crear el pedido. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-[#22242C] border border-[#2E3038] rounded-xl px-4 py-3 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#D4A017] transition-colors text-sm";

  return (
    <main className="min-h-screen bg-[#0F1117] px-4 py-4 pb-24">
      <div className="max-w-lg mx-auto space-y-3">

        {/* Form card */}
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
                }}
                className="text-[#6B7280] text-xs hover:text-[#9CA3AF] transition-colors"
              >
                Cambiar datos
              </button>
            )}
          </div>

          {/* Returning customer banner */}
          {returning && (
            <div className="mb-4 bg-[#1E2A1A] border border-green-800/30 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <CheckCircle size={14} className="text-green-400 shrink-0" />
              <p className="text-green-400 text-xs font-medium">
                ¡Bienvenido de vuelta, <strong>{form.name.split(" ")[0]}</strong>! Tus datos están listos.
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[#9CA3AF] text-xs mb-1.5 block font-medium">Nombre completo *</label>
                <input
                  className={inputClass}
                  placeholder="Tu nombre"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-[#9CA3AF] text-xs mb-1.5 block font-medium">Email *</label>
                <input
                  className={inputClass}
                  type="email"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-[#9CA3AF] text-xs mb-1.5 block font-medium">Teléfono *</label>
                <input
                  className={inputClass}
                  placeholder="300 000 0000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-[#9CA3AF] text-xs mb-1.5 block font-medium">Dirección de entrega *</label>
                <input
                  className={inputClass}
                  placeholder="Calle, barrio, ciudad"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-[#9CA3AF] text-xs mb-1.5 block font-medium">Notas (opcional)</label>
              <textarea
                className={`${inputClass} resize-none h-20`}
                placeholder="Sin cebolla, extra queso, indicaciones de entrega..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <p className="text-[#6B7280] text-xs">
              Al continuar, crearemos una cuenta para acumular puntos y rastrear tus pedidos.
            </p>

            {/* Order summary inline */}
            <div className="bg-[#22242C] rounded-xl p-4 space-y-2 text-sm">
              {items.map(({ item, quantity }) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-[#9CA3AF]">{item.name} <span className="text-[#6B7280]">x{quantity}</span></span>
                  <span className="text-white font-medium">${(item.price * quantity).toLocaleString("es-CO")}</span>
                </div>
              ))}
              <div className="flex justify-between text-[#9CA3AF] pt-1 border-t border-[#2E3038]">
                <span>Domicilio</span>
                <span>${delivery.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1">
                <span className="text-white">Total</span>
                <span className="text-[#D4A017]">${grandTotal.toLocaleString("es-CO")}</span>
              </div>
            </div>

            {/* Points strip */}
            <div className="bg-[#2A2414] rounded-xl px-4 py-2.5 flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <p className="text-[#E8B830] text-xs font-medium">
                Ganarás <strong>{Math.floor(grandTotal / 1000)} puntos</strong> con este pedido
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D4A017] disabled:opacity-50 disabled:cursor-not-allowed text-[#0F1117] font-bold py-4 rounded-xl text-base"
            >
              {loading ? "Procesando..." : `Pagar $${grandTotal.toLocaleString("es-CO")} con Wompi`}
            </button>
          </form>
        </div>

      </div>
    </main>
  );
}
