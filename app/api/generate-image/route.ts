import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Receives a Pollinations URL that the browser already loaded (so it's cached).
// Downloads it server-side (no CORS restriction) and uploads to Supabase Storage.
// This is fast (<5s) because the image is already cached by Pollinations.
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string" || !url.startsWith("https://image.pollinations.ai/")) {
      return NextResponse.json({ error: "URL inválida." }, { status: 400 });
    }

    const imageRes = await fetch(url);

    if (!imageRes.ok) {
      return NextResponse.json({ error: "No se pudo descargar la imagen generada." }, { status: 502 });
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
    console.error("Generate image error:", err);
    return NextResponse.json({ error: err.message ?? "Error al guardar imagen" }, { status: 500 });
  }
}
