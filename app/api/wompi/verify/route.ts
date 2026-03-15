import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { transactionId, orderNumber } = await req.json();

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

    // Update order in Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase
      .from("orders")
      .update({
        payment_status: paymentStatus,
        wompi_transaction_id: transactionId,
      })
      .eq("order_number", orderNumber);

    return NextResponse.json({
      status: transaction.status,       // APPROVED | DECLINED | PENDING | ERROR
      paymentStatus,                    // paid | failed | pending
      amount: transaction.amount_in_cents,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error verificando pago";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
