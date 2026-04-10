import { NextRequest, NextResponse } from "next/server";

/**
 * Rate limiting usando Upstash Redis REST API.
 * Si las variables de entorno no están configuradas, se omite silenciosamente.
 *
 * @param req      - NextRequest entrante
 * @param route    - Identificador único de la ruta (ej: "wompi-verify")
 * @param limit    - Máximo de requests permitidos en la ventana
 * @param windowSec - Tamaño de la ventana en segundos
 * @returns NextResponse con 429 si se excede el límite, null si está permitido
 */
export async function rateLimit(
  req: NextRequest,
  route: string,
  limit: number,
  windowSec: number
): Promise<NextResponse | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Si Upstash no está configurado, dejar pasar
  if (!url || !token) return null;

  const ip =
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown";

  const key = `rl:${route}:${ip}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - windowSec;

  // Pipeline: limpiar entradas viejas → agregar entrada actual → contar → expirar clave
  const pipeline = [
    ["ZREMRANGEBYSCORE", key, "-inf", String(windowStart)],
    ["ZADD", key, String(now), `${now}-${Math.random().toString(36).slice(2)}`],
    ["ZCOUNT", key, String(windowStart), "+inf"],
    ["EXPIRE", key, String(windowSec * 2)],
  ];

  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pipeline),
    });

    if (!res.ok) return null; // Si Redis falla, dejar pasar

    const results: Array<{ result: number }> = await res.json();
    const count = results[2]?.result ?? 0;

    if (count > limit) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Espera un momento e intenta de nuevo." },
        {
          status: 429,
          headers: { "Retry-After": String(windowSec) },
        }
      );
    }
  } catch {
    // Si hay error de red con Redis, dejar pasar (fail open)
    return null;
  }

  return null;
}
