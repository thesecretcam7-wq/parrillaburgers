"use client";

export type BrandEmojiName =
  | "burger" | "fries" | "hotdog" | "soda" | "grill"
  | "cheese" | "scooter" | "face" | "coupon" | "flame" | "timer";

interface BrandEmojiProps {
  name: BrandEmojiName;
  size?: number;
  className?: string;
}

export function BrandEmoji({ name, size = 32, className = "" }: BrandEmojiProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/emojis/${name}.png`}
      alt={name}
      width={size}
      height={size}
      className={`inline-block object-contain ${className}`}
      draggable={false}
    />
  );
}
