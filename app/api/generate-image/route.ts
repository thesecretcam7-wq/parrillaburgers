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

    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) {
      return NextResponse.json(
        { error: "Generación IA no configurada. Agrega HF_TOKEN en las variables de entorno." },
        { status: 503 }
      );
    }

    // FLUX.1-schnell via Hugging Face Inference API
    // Free with a HF account — fast (~5s), reliable
    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt.trim(),
          parameters: { num_inference_steps: 4 },
        }),
      }
    );

    if (!hfRes.ok) {
      const errText = await hfRes.text();
      console.error("HF error:", errText);

      // Model loading (cold start) — tell client to retry
      if (hfRes.status === 503) {
        return NextResponse.json(
          { error: "El modelo está iniciando, intenta de nuevo en 20 segundos.", retry: true },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: "Error al generar la imagen. Intenta de nuevo." },
        { status: 502 }
      );
    }

    const arrayBuffer = await hfRes.arrayBuffer();
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
    return NextResponse.json({ error: err.message ?? "Error al generar imagen" }, { status: 500 });
  }
}
