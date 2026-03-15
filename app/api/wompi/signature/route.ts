import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { reference, amountInCents, currency } = await req.json();

    if (!reference || !amountInCents || !currency) {
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
    }

    const integrityKey = process.env.WOMPI_INTEGRITY_KEY;
    if (!integrityKey) {
      return NextResponse.json({ error: "Wompi no configurado" }, { status: 503 });
    }

    // Wompi signature: SHA-256(reference + amountInCents + currency + integrityKey)
    const stringToHash = `${reference}${amountInCents}${currency}${integrityKey}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(stringToHash);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    return NextResponse.json({ signature });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error generando firma";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
