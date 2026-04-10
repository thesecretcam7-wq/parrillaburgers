import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/utils/rate-limit";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, "wompi-verify", 10, 60);
  if (rl) return rl;

  try {
    const { transactionId, orderNumber, fullOrderData } = await req.json();

    if (!transactionId || !orderNumber) {
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
    }

    const privateKey = process.env.WOMPI_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json({ error: "Wompi no configurado" }, { status: 503 });
    }

    const issandbox = process.env.NEXT_PUBLIC_WOMPI_ENV !== "production";
    const apiBase = issandbox
      ? "https://sandbox.wompi.co/v1"
      : "https://production.wompi.co/v1";

    // Verify transaction with Wompi API
    const wompiRes = await fetch(`${apiBase}/transactions/${transactionId}`, {
      headers: { Authorization: `Bearer ${privateKey}` },
    });

    if (!wompiRes.ok) {
      return NextResponse.json({ error: "No se pudo verificar la transacción" }, { status: 502 });
    }

    const { data: transaction } = await wompiRes.json();

    // Security: verify the reference matches
    if (transaction.reference !== orderNumber) {
      return NextResponse.json({ error: "Referencia no coincide" }, { status: 400 });
    }

    const paymentStatus =
      transaction.status === "APPROVED"
        ? "paid"
        : transaction.status === "PENDING"
        ? "pending"
        : "failed";

    // Initialize Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if order already exists
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id, order_number")
      .eq("order_number", orderNumber)
      .single();

    // If payment is approved and order doesn't exist yet, create it
    if (paymentStatus === "paid" && !existingOrder && fullOrderData) {
      const { data: order, error: createError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_id: fullOrderData.customer_id ?? null,
          customer_name: fullOrderData.customer_name,
          customer_email: fullOrderData.customer_email,
          customer_phone: fullOrderData.customer_phone,
          delivery_address: fullOrderData.delivery_address,
          notes: fullOrderData.notes || null,
          items: fullOrderData.items,
          subtotal: fullOrderData.subtotal,
          delivery_fee: fullOrderData.delivery_fee,
          total: fullOrderData.total,
          status: "pending",
          payment_status: "paid",
          wompi_transaction_id: transactionId,
          points_earned: fullOrderData.points_earned,
          coupon_code: fullOrderData.coupon_code ?? null,
          coupon_discount: fullOrderData.coupon_discount || null,
          mesa_number: fullOrderData.mesa_number ?? null,
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating order:", createError);
        return NextResponse.json({ error: "Error al crear el pedido" }, { status: 500 });
      }

      // Deduct used points and add earned points
      if (fullOrderData.customer_id) {
        const { data: customer } = await supabase
          .from("customers")
          .select("points")
          .eq("id", fullOrderData.customer_id)
          .single();

        if (customer) {
          const newPoints = customer.points - (fullOrderData.pointsUsed || 0) + fullOrderData.points_earned;
          await supabase
            .from("customers")
            .update({ points: newPoints })
            .eq("id", fullOrderData.customer_id);
        }
      }

      // Increment coupon uses_count if a coupon was used
      if (fullOrderData.coupon_code) {
        const { data: couponData } = await supabase
          .from("coupons")
          .select("id, uses_count")
          .eq("code", fullOrderData.coupon_code)
          .single();

        if (couponData) {
          await supabase
            .from("coupons")
            .update({ uses_count: couponData.uses_count + 1 })
            .eq("id", couponData.id);
        }
      }

      return NextResponse.json({
        status: transaction.status,
        paymentStatus,
        orderId: order?.id,
        orderNumber: order?.order_number,
        amount: transaction.amount_in_cents,
        message: "Pago confirmado y pedido creado",
      });
    }

    // If order already exists and payment is approved, just confirm the status
    if (existingOrder && paymentStatus === "paid") {
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          wompi_transaction_id: transactionId,
        })
        .eq("order_number", orderNumber);

      return NextResponse.json({
        status: transaction.status,
        paymentStatus,
        orderNumber,
        amount: transaction.amount_in_cents,
        message: "Pago confirmado",
      });
    }

    // If payment failed
    if (paymentStatus === "failed") {
      if (existingOrder) {
        await supabase
          .from("orders")
          .update({
            payment_status: "failed",
            status: "cancelled",
            wompi_transaction_id: transactionId,
          })
          .eq("order_number", orderNumber);
      }

      return NextResponse.json({
        status: transaction.status,
        paymentStatus,
        amount: transaction.amount_in_cents,
        message: "Pago rechazado",
      });
    }

    // If payment is still pending
    return NextResponse.json({
      status: transaction.status,
      paymentStatus,
      amount: transaction.amount_in_cents,
      message: "Pago en proceso",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error verificando pago";
    console.error("Wompi verify error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
