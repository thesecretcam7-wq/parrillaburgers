"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, Clock, Flame, MapPin, Play, ShieldCheck, Sparkles, Star, UtensilsCrossed, Zap } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Banner, MenuItem } from "@/lib/types";

type SpecialOffer = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  active: boolean;
};

type PremiumHomeExperienceProps = {
  banners: Banner[];
  menuItems: MenuItem[];
  offers: SpecialOffer[];
  isOpen: boolean;
  barraActiva: boolean;
  barraTexto: string;
  barraEmoji: string;
};

const fallbackItems = [
  {
    id: "signature",
    name: "Smash Parrilla Gold",
    description: "Doble carne sellada al fuego, queso fundido, tocineta crocante y salsa de la casa.",
    price: 18900,
    image_url: "/emojis/burger.png",
  },
  {
    id: "fire",
    name: "Fuego Ahumado",
    description: "Carne artesanal, chimichurri, cebolla caramelizada y golpe de parrilla.",
    price: 20900,
    image_url: "/emojis/grill.png",
  },
  {
    id: "combo",
    name: "Urban Combo",
    description: "Burger premium, papas doradas y bebida fria para modo callejero de lujo.",
    price: 24900,
    image_url: "/emojis/combos.png",
  },
];

const gallery = [
  { src: "/emojis/burger.png", label: "Carne al fuego" },
  { src: "/emojis/grill.png", label: "Parrilla viva" },
  { src: "/emojis/fries.png", label: "Papas doradas" },
  { src: "/emojis/cheese.png", label: "Queso fundido" },
  { src: "/emojis/soda.png", label: "Combos urbanos" },
  { src: "/emojis/flame.png", label: "Sabor ahumado" },
];

const testimonials = [
  {
    quote: "La marca se siente premium desde que abres la web. La burger llega con ese sabor real de parrilla.",
    name: "Camila R.",
    tag: "Pedido delivery",
  },
  {
    quote: "Visualmente brutal y la comida igual. Ese toque ahumado la separa de las hamburguesas normales.",
    name: "Mateo G.",
    tag: "Cliente frecuente",
  },
  {
    quote: "Pedir desde el celular se siente rapido, claro y muy fino. Parece una app de una marca grande.",
    name: "Laura M.",
    tag: "Mesa QR",
  },
];

function formatPrice(price: number | string | null | undefined) {
  return `$${Number(price ?? 0).toLocaleString("es-CO")}`;
}

function imageForItem(item: Partial<MenuItem> & { image_url?: string | null }, index: number) {
  return item.image_url || fallbackItems[index % fallbackItems.length].image_url;
}

function CursorGlow() {
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const smoothX = useSpring(x, { stiffness: 140, damping: 22 });
  const smoothY = useSpring(y, { stiffness: 140, damping: 22 });

  useEffect(() => {
    const move = (event: MouseEvent) => {
      setVisible(true);
      x.set(event.clientX - 16);
      y.set(event.clientY - 16);
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[80] hidden h-8 w-8 rounded-full border border-[#F5B041]/40 bg-[#F5B041]/10 shadow-[0_0_34px_rgba(245,176,65,0.28)] backdrop-blur-sm lg:block"
      style={{ x: smoothX, y: smoothY, opacity: visible ? 1 : 0 }}
    />
  );
}

function LoadingIntro() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setLoading(false), 1200);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!loading) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[90] grid place-items-center bg-[#070707]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,176,65,0.16),transparent_38%),radial-gradient(circle_at_50%_85%,rgba(255,72,31,0.18),transparent_34%)]" />
      <motion.div
        initial={{ scale: 0.84, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col items-center"
      >
        <div className="relative grid h-28 w-28 place-items-center rounded-full border border-[#F5B041]/25 bg-white/[0.03] shadow-[0_0_70px_rgba(245,176,65,0.2)]">
          <Image src="/logo-real.png" alt="ParrillaBurgers" width={92} height={92} priority className="h-20 w-20 object-contain" />
          <motion.span
            className="absolute inset-0 rounded-full border-t border-[#F5B041]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="mt-5 font-[var(--font-premium)] text-xs font-black uppercase tracking-[0.45em] text-[#F5B041]"
        >
          Encendiendo parrilla
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function PremiumHomeExperience({
  banners,
  menuItems,
  offers,
  isOpen,
  barraActiva,
  barraTexto,
  barraEmoji,
}: PremiumHomeExperienceProps) {
  const heroY = useMotionValue(0);
  const heroImageY = useTransform(heroY, [0, 1], [0, -28]);
  const displayItems = useMemo(() => {
    const realItems = menuItems.slice(0, 3);
    if (realItems.length >= 3) return realItems;
    return [...realItems, ...fallbackItems].slice(0, 3) as MenuItem[];
  }, [menuItems]);

  const heroBanner = banners[0]?.image_url;

  return (
    <main
      className="premium-home relative min-h-screen overflow-hidden bg-[#0B0B0B] text-white"
      onMouseMove={() => heroY.set(1)}
      onMouseLeave={() => heroY.set(0)}
    >
      <LoadingIntro />
      <CursorGlow />

      <section className="relative min-h-[100svh] overflow-hidden px-4 pt-28 sm:px-6 lg:px-8">
        <div className="absolute inset-0">
          {heroBanner ? (
            <Image src={heroBanner} alt="Hamburguesa premium a la parrilla" fill priority className="object-cover opacity-42" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,119,31,0.2),transparent_30%),linear-gradient(135deg,#0B0B0B_0%,#15110D_46%,#060606_100%)]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.42),#0B0B0B_88%),radial-gradient(circle_at_20%_20%,rgba(245,176,65,0.22),transparent_30%),radial-gradient(circle_at_78%_34%,rgba(255,60,31,0.18),transparent_28%)]" />
          <div className="smoke-layer absolute inset-x-0 bottom-0 h-2/3 opacity-60" />
        </div>

        <div className="pointer-events-none absolute left-[-12rem] top-20 h-72 w-72 rounded-full bg-[#F5B041]/14 blur-3xl" />
        <div className="pointer-events-none absolute right-[-12rem] top-44 h-80 w-80 rounded-full bg-[#FF4B1F]/14 blur-3xl" />

        <div className="relative mx-auto grid min-h-[calc(100svh-7rem)] max-w-7xl items-center gap-10 lg:grid-cols-[1fr_0.86fr]">
          <div className="max-w-3xl pb-8">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#F5B041]/25 bg-white/[0.05] px-4 py-2 text-[11px] font-black uppercase tracking-[0.26em] text-[#F5B041] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl"
            >
              <span className={`h-2 w-2 rounded-full ${isOpen ? "bg-emerald-400" : "bg-[#FF3B1F]"} shadow-[0_0_16px_currentColor]`} />
              {isOpen ? "Abierto ahora" : "Parrilla cerrada"} · 6:00 PM - 11:59 PM
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="font-[var(--font-display)] text-[clamp(4.5rem,10vw,8.8rem)] leading-[0.8] tracking-normal text-white"
            >
              EL SABOR DE LA
              <span className="block bg-gradient-to-r from-[#F5B041] via-[#FF7A1F] to-[#FF3B1F] bg-clip-text text-transparent drop-shadow-[0_0_34px_rgba(255,90,31,0.24)]">
                PARRILLA
              </span>
              EN OTRO NIVEL
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.42 }}
              className="mt-6 max-w-2xl font-[var(--font-premium)] text-base font-semibold leading-7 text-white/68 sm:text-lg"
            >
              Street food premium, carne sellada al fuego, queso fundido y una experiencia digital pensada para pedir rapido desde el celular.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link href="/menu" className="liquid-button group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#F5B041] px-7 py-4 font-[var(--font-premium)] text-sm font-black uppercase tracking-[0.16em] text-black shadow-[0_18px_60px_rgba(245,176,65,0.28)] transition hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(245,176,65,0.38)]">
                Pedir ahora
                <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </Link>
              <Link href="/menu" className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-white/14 bg-white/[0.045] px-7 py-4 font-[var(--font-premium)] text-sm font-black uppercase tracking-[0.16em] text-white backdrop-blur-xl transition hover:border-[#F5B041]/50 hover:bg-[#F5B041]/10">
                <Play size={17} />
                Ver menu
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75 }}
              className="mt-8 grid grid-cols-3 gap-3 max-w-xl"
            >
              {[
                ["4.9", "Rating"],
                ["15 min", "Pickup"],
                ["100%", "Parrilla"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl">
                  <p className="font-[var(--font-display)] text-3xl leading-none text-white">{value}</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-white/42">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            style={{ y: heroImageY }}
            initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto hidden aspect-square w-full max-w-[34rem] lg:block"
          >
            <div className="absolute inset-12 rounded-full bg-[#FF5A1F]/20 blur-3xl" />
            <div className="absolute inset-8 rounded-full border border-[#F5B041]/20 bg-[radial-gradient(circle,rgba(245,176,65,0.15),transparent_60%)]" />
            <Image src="/emojis/burger.png" alt="Burger premium" fill priority className="object-contain drop-shadow-[0_35px_80px_rgba(0,0,0,0.72)]" />
            <motion.div
              animate={{ y: [0, -12, 0], rotate: [0, 4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-2 top-20 rounded-3xl border border-[#F5B041]/25 bg-black/50 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl"
            >
              <Flame className="text-[#FF5A1F]" />
              <p className="mt-2 text-xs font-black uppercase tracking-[0.2em] text-white/70">Fire grilled</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {offers.length > 0 || barraActiva ? (
        <section className="relative border-y border-white/8 bg-[#101010] px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-4">
            {(offers.length ? offers : [
              { id: "barra", title: "Barra libre", emoji: barraEmoji, description: barraTexto, active: true },
              { id: "puntos", title: "Gana puntos", emoji: "★", description: "100 pts = $1.000", active: true },
              { id: "delivery", title: "Delivery", emoji: "→", description: "Rapido y caliente", active: true },
              { id: "fire", title: "Parrilla", emoji: "🔥", description: "Sabor ahumado", active: true },
            ]).slice(0, 4).map((offer, index) => (
              <Reveal key={offer.id} delay={index * 0.04}>
                <Link href="/menu" className="group flex min-h-28 items-center gap-4 rounded-[24px] border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#F5B041]/35 hover:bg-[#F5B041]/8">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#F5B041]/12 text-3xl shadow-[0_0_30px_rgba(245,176,65,0.12)]">{offer.emoji}</span>
                  <span>
                    <span className="block font-[var(--font-premium)] text-sm font-black uppercase tracking-[0.08em] text-white">{offer.title}</span>
                    <span className="mt-1 block text-sm font-semibold text-white/48">{offer.description}</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_30%,rgba(245,176,65,0.12),transparent_28%),radial-gradient(circle_at_85%_40%,rgba(255,59,31,0.09),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl">
          <Reveal>
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="mb-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.32em] text-[#F5B041]"><Sparkles size={15} /> Best sellers</p>
                <h2 className="font-[var(--font-display)] text-6xl leading-[0.86] text-white sm:text-8xl">HAMBURGUESAS DESTACADAS</h2>
              </div>
              <Link href="/menu" className="group inline-flex items-center gap-2 font-[var(--font-premium)] text-sm font-black uppercase tracking-[0.18em] text-white/70 transition hover:text-[#F5B041]">
                Ver todo el menu <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {displayItems.map((item, index) => (
              <Reveal key={item.id} delay={index * 0.08}>
                <Link href="/menu" className="premium-card group relative block min-h-[31rem] overflow-hidden rounded-[30px] border border-white/10 bg-[#121212] p-4 shadow-[0_24px_90px_rgba(0,0,0,0.36)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,176,65,0.16),transparent_42%)] opacity-70 transition group-hover:opacity-100" />
                  <div className="relative aspect-square overflow-hidden rounded-[24px] bg-[#090909]">
                    <Image src={imageForItem(item, index)} alt={item.name} fill sizes="(min-width: 768px) 33vw, 90vw" className="object-contain p-4 transition duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-white/5" />
                    <span className="absolute left-4 top-4 rounded-full border border-[#F5B041]/25 bg-black/40 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#F5B041] backdrop-blur-xl">Signature</span>
                  </div>
                  <div className="relative p-3">
                    <div className="mb-3 flex items-center gap-1 text-[#F5B041]">
                      {[0, 1, 2, 3, 4].map((star) => <Star key={star} size={14} fill="currentColor" />)}
                    </div>
                    <h3 className="font-[var(--font-premium)] text-2xl font-black uppercase tracking-[-0.02em] text-white">{item.name}</h3>
                    <p className="mt-3 min-h-12 text-sm font-medium leading-6 text-white/52">{item.description}</p>
                    <div className="mt-6 flex items-center justify-between">
                      <span className="font-[var(--font-display)] text-4xl text-[#F5B041]">{formatPrice(item.price)}</span>
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-black transition group-hover:bg-[#F5B041]"><ArrowRight size={18} /></span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-white/8 bg-[#0F0F0F] px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.04),transparent_28%,rgba(245,176,65,0.08)_48%,transparent_70%),repeating-linear-gradient(135deg,rgba(255,255,255,0.04)_0_1px,transparent_1px_18px)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <div className="relative min-h-[28rem] overflow-hidden rounded-[34px] border border-white/10 bg-black shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
              <Image src="/emojis/grill.png" alt="Parrilla premium" fill className="object-contain p-12 opacity-90" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_78%,rgba(255,74,31,0.28),transparent_36%),linear-gradient(180deg,transparent,#060606)]" />
              <div className="absolute bottom-6 left-6 right-6 rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl">
                <p className="font-[var(--font-premium)] text-xs font-black uppercase tracking-[0.28em] text-[#F5B041]">Carne, fuego, tecnica</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-white/58">No es comida rapida generica. Es parrilla urbana con presencia, textura y sabor de marca premium.</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mb-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.32em] text-[#F5B041]"><Flame size={15} /> Sobre nosotros</p>
            <h2 className="font-[var(--font-display)] text-6xl leading-[0.86] text-white sm:text-8xl">LUJO URBANO A LA PARRILLA</h2>
            <p className="mt-6 max-w-2xl font-[var(--font-premium)] text-base font-semibold leading-8 text-white/62">
              ParrillaBurgers mezcla el espiritu callejero de una burger shop viral con una ejecucion visual y gastronomica mas fina: fuego real, ingredientes honestos, salsas con personalidad y una experiencia digital lista para vender.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                [Zap, "Rapido", "Flujo mobile-first"],
                [ShieldCheck, "Premium", "Marca confiable"],
                [MapPin, "Local", "Sabor de ciudad"],
              ].map(([Icon, title, text]) => {
                const TypedIcon = Icon as typeof Zap;
                return (
                  <div key={String(title)} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                    <TypedIcon className="text-[#F5B041]" size={22} />
                    <p className="mt-4 font-[var(--font-premium)] text-sm font-black uppercase tracking-[0.18em] text-white">{String(title)}</p>
                    <p className="mt-2 text-sm font-semibold text-white/44">{String(text)}</p>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="mb-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.32em] text-[#F5B041]"><Award size={15} /> Social proof</p>
                <h2 className="font-[var(--font-display)] text-6xl leading-[0.86] text-white sm:text-8xl">LO QUE DICEN</h2>
              </div>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Reveal key={testimonial.name} delay={index * 0.08}>
                <div className="h-full rounded-[28px] border border-white/10 bg-white/[0.045] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
                  <div className="flex gap-1 text-[#F5B041]">
                    {[0, 1, 2, 3, 4].map((star) => <Star key={star} size={15} fill="currentColor" />)}
                  </div>
                  <p className="mt-6 text-base font-semibold leading-7 text-white/68">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="mt-8 border-t border-white/10 pt-4">
                    <p className="font-[var(--font-premium)] text-sm font-black uppercase tracking-[0.18em] text-white">{testimonial.name}</p>
                    <p className="mt-1 text-sm font-semibold text-[#F5B041]/80">{testimonial.tag}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mb-10">
              <p className="mb-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.32em] text-[#F5B041]"><UtensilsCrossed size={15} /> Galeria</p>
              <h2 className="font-[var(--font-display)] text-6xl leading-[0.86] text-white sm:text-8xl">INSTAGRAM ENERGY</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
            {gallery.map((item, index) => (
              <Reveal key={item.label} delay={index * 0.035}>
                <div className={`group relative overflow-hidden rounded-[24px] border border-white/10 bg-[#111] ${index % 3 === 0 ? "md:col-span-2 md:row-span-2" : ""}`}>
                  <div className="aspect-square">
                    <Image src={item.src} alt={item.label} fill sizes="(min-width: 768px) 18vw, 45vw" className="object-contain p-6 transition duration-700 group-hover:scale-110" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                  <p className="absolute bottom-4 left-4 right-4 text-xs font-black uppercase tracking-[0.18em] text-white/80">{item.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[36px] border border-[#F5B041]/20 bg-[#120D08] px-6 py-14 text-center shadow-[0_30px_120px_rgba(245,91,31,0.12)] sm:px-10 lg:py-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,176,65,0.24),transparent_36%),radial-gradient(circle_at_50%_100%,rgba(255,59,31,0.18),transparent_34%)]" />
            <div className="relative mx-auto max-w-4xl">
              <Clock className="mx-auto mb-5 text-[#F5B041]" size={34} />
              <h2 className="font-[var(--font-display)] text-6xl leading-[0.82] text-white sm:text-8xl">¿LISTO PARA PROBAR LA MEJOR BURGER DE LA CIUDAD?</h2>
              <p className="mx-auto mt-6 max-w-2xl font-[var(--font-premium)] text-base font-semibold leading-7 text-white/62">Pide ahora, acumula puntos y vive la parrilla premium desde tu celular.</p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/menu" className="liquid-button inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#F5B041] px-8 py-4 font-[var(--font-premium)] text-sm font-black uppercase tracking-[0.16em] text-black shadow-[0_18px_60px_rgba(245,176,65,0.28)] transition hover:-translate-y-1">
                  Ordenar ahora <ArrowRight size={18} />
                </Link>
                <Link href="/mis-pedidos" className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/14 bg-white/[0.045] px-8 py-4 font-[var(--font-premium)] text-sm font-black uppercase tracking-[0.16em] text-white backdrop-blur-xl transition hover:border-[#F5B041]/50">
                  Seguir pedido
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
