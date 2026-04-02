import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

export async function POST(req: NextRequest) {
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

    // Update order with payment status
    const orderUpdate: Record<string, unknown> = {
      payment_status: paymentStatus,
      wompi_transaction_id: transactionId,
    };

    // If payment failed, also cancel the order
    if (paymentStatus === "failed") {
      orderUpdate.status = "cancelled";
    }

    // If payment is approved, keep status as "pending" for admin confirmation
    // (already created in /pedido/page.tsx)

    await supabase
      .from("orders")
      .update(orderUpdate)
      .eq("order_number", orderNumber);

    // Deduct points and increment coupon ONLY if payment is approved
    if (paymentStatus === "paid" && fullOrderData) {
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
    }

    return NextResponse.json({
      status: transaction.status,
      paymentStatus,
      orderNumber,
      amount: transaction.amount_in_cents,
      message: paymentStatus === "paid" ? "Pago confirmado" : paymentStatus === "failed" ? "Pago rechazado" : "Pago en proceso",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error verificando pago";
    console.error("Wompi verify error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
