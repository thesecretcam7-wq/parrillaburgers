import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json({ error: "El prompt no puede estar vacío." }, { status: 400 });
    }

    if (prompt.length > 500) {
      return NextResponse.json({ error: "El prompt no puede superar los 500 caracteres." }, { status: 400 });
    }

    // Call Pollinations.ai — free, no API key needed
    const encodedPrompt = encodeURIComponent(prompt.trim());
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&model=flux&seed=${Date.now()}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

    let imageRes: Response;
    try {
      imageRes = await fetch(pollinationsUrl, { signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }

    if (!imageRes.ok) {
      return NextResponse.json({ error: "Error al generar la imagen. Intenta de nuevo." }, { status: 502 });
    }

    const arrayBuffer = await imageRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filename = `ai-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("menu-images")
      .upload(filename, buffer, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabaseAdmin.storage
      .from("menu-images")
      .getPublicUrl(filename);

    return NextResponse.json({ url: data.publicUrl });
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return NextResponse.json({ error: "La generación tardó demasiado. Intenta con un prompt más sencillo." }, { status: 504 });
    }
    console.error("Generate image error:", err);
    return NextResponse.json({ error: err.message ?? "Error al generar imagen" }, { status: 500 });
  }
}
