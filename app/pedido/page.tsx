"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/store/cart";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft, User, Phone, Mail, MapPin, StickyNote } from "lucide-react";

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
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  const subtotal = total();
  const delivery = 3000;
  const grandTotal = subtotal + delivery;

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#111217] flex flex-col items-center justify-center px-4">
        <p className="text-[#888899] mb-4">No tienes productos en tu carrito</p>
        <Link href="/menu" className="text-[#D4A017] hover:underline">
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

      // Upsert customer
      const { data: customer } = await supabase
        .from("customers")
        .upsert(
          { email: form.email, name: form.name, phone: form.phone, address: form.address },
          { onConflict: "email" }
        )
        .select()
        .single();

      // Generate order number
      const orderNumber = `PB-${Date.now().toString().slice(-6)}`;

      const orderItems = items.map((ci) => ({
        menu_item_id: ci.item.id,
        menu_item_name: ci.item.name,
        quantity: ci.quantity,
        unit_price: ci.item.price,
        subtotal: ci.item.price * ci.quantity,
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

      // Redirect to Wompi payment
      const wompiKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;
      if (wompiKey && order) {
        const wompiUrl = new URL("https://checkout.wompi.co/p/");
        wompiUrl.searchParams.set("public-key", wompiKey);
        wompiUrl.searchParams.set("currency", "COP");
        wompiUrl.searchParams.set("amount-in-cents", String(grandTotal * 100));
        wompiUrl.searchParams.set("reference", order.order_number);
        wompiUrl.searchParams.set(
          "redirect-url",
          `${process.env.NEXT_PUBLIC_APP_URL}/seguimiento?order=${order.order_number}`
        );
        clearCart();
        window.location.href = wompiUrl.toString();
      } else {
        // Dev mode without Wompi
        clearCart();
        toast.success(`Pedido ${orderNumber} creado. Redirigiendo...`);
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
    "w-full bg-[#1A1B21] border border-[#2E3038] rounded-lg px-4 py-3 text-[#F5F0E8] placeholder-[#888899] focus:outline-none focus:border-[#D4A017] transition-colors text-sm";

  return (
    <main className="min-h-screen bg-[#111217] px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/carrito"
          className="flex items-center gap-2 text-[#888899] hover:text-[#D4A017] transition-colors text-sm mb-8"
        >
          <ArrowLeft size={16} /> Volver al carrito
        </Link>

        <h1 className="text-3xl font-black text-[#F5F0E8] mb-8">Completa tu pedido</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
            <div className="bg-[#22232B] border border-[#2E3038] rounded-xl p-6">
              <h2 className="text-[#F5F0E8] font-bold mb-5 flex items-center gap-2">
                <User size={18} className="text-[#D4A017]" />
                Tus datos
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#CCCCCC] text-xs mb-1.5 block">Nombre completo *</label>
                  <input
                    className={inputClass}
                    placeholder="Tu nombre"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-[#CCCCCC] text-xs mb-1.5 block">Email *</label>
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
                  <label className="text-[#CCCCCC] text-xs mb-1.5 block">Teléfono *</label>
                  <input
                    className={inputClass}
                    placeholder="300 000 0000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-[#CCCCCC] text-xs mb-1.5 block">Dirección de entrega *</label>
                  <input
                    className={inputClass}
                    placeholder="Calle, barrio, ciudad"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-[#CCCCCC] text-xs mb-1.5 block">Notas adicionales (opcional)</label>
                <textarea
                  className={`${inputClass} resize-none h-20`}
                  placeholder="Sin cebolla, extra queso, indicaciones de entrega..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <p className="text-[#888899] text-xs mt-3">
                Al continuar, crearemos una cuenta para que puedas acumular puntos y rastrear tus pedidos.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D4A017] hover:bg-[#E8B830] disabled:opacity-50 disabled:cursor-not-allowed text-[#111217] font-bold py-4 rounded-xl transition-colors text-base"
            >
              {loading ? "Procesando..." : `Pagar $${grandTotal.toLocaleString("es-CO")} con Wompi`}
            </button>
          </form>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#22232B] border border-[#2E3038] rounded-xl p-5 sticky top-24">
              <h3 className="text-[#F5F0E8] font-bold mb-4">Tu pedido</h3>
              <div className="space-y-2 mb-4">
                {items.map(({ item, quantity }) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-[#CCCCCC]">
                      {item.name} <span className="text-[#888899]">x{quantity}</span>
                    </span>
                    <span className="text-[#F5F0E8]">${(item.price * quantity).toLocaleString("es-CO")}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#2E3038] pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-[#CCCCCC]">
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString("es-CO")}</span>
                </div>
                <div className="flex justify-between text-[#CCCCCC]">
                  <span>Domicilio</span>
                  <span>${delivery.toLocaleString("es-CO")}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-1">
                  <span className="text-[#F5F0E8]">Total</span>
                  <span className="text-[#D4A017]">${grandTotal.toLocaleString("es-CO")}</span>
                </div>
              </div>
              <p className="text-[#D4A017] text-xs mt-3 text-center">
                🎯 Ganarás {Math.floor(grandTotal / 1000)} puntos
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
