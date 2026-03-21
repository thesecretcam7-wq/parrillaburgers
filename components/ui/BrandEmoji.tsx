"use client";

import Image from "next/image";

/**
 * Emojis personalizados de ParillaBurgers.
 *
 * Archivos esperados en /public/emojis/:
 *   burger.png       → hamburguesa con llamas
 *   fries.png        → papas fritas con llamas
 *   hotdog.png       → perro caliente con llamas
 *   soda.png         → soda con llamas
 *   grill.png        → parrilla con llamas
 *   cheese.png       → queso derritiéndose
 *   scooter.png      → moto de domicilio
 *   face.png         → cara de antojo
 *   coupon.png       → hamburguesa con % (cupón)
 *   flame.png        → hamburguesa en llamas (lo más pedido)
 *   timer.png        → hamburguesa con reloj (tiempo estimado)
 */

export type BrandEmojiName =
  | "burger"
  | "fries"
  | "hotdog"
  | "soda"
  | "grill"
  | "cheese"
  | "scooter"
  | "face"
  | "coupon"
  | "flame"
  | "timer";

interface BrandEmojiProps {
  name: BrandEmojiName;
  size?: number;
  className?: string;
}

const EXT: Record<BrandEmojiName, string> = {
  burger: "webp", flame: "webp", fries: "webp", scooter: "webp", face: "webp", timer: "webp",
  coupon: "png",  hotdog: "png",  soda: "png",  grill: "png",  cheese: "png",
};

export function BrandEmoji({ name, size = 32, className = "" }: BrandEmojiProps) {
  return (
    <Image
      src={`/emojis/${name}.${EXT[name]}`}
      alt={name}
      width={size}
      height={size}
      className={`inline-block object-contain ${className}`}
      draggable={false}
    />
  );
}
