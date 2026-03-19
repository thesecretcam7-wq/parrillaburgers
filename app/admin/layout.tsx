"use client";

import Link from "next/link";
import NextImage from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, Users, Image, Menu, X, ArrowLeft, Tag, Settings, LogOut, BarChart2, Ticket, Star, QrCode } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const navLinks = [
  { href: "/admin",                label: "Dashboard",      icon: LayoutDashboard },
  { href: "/admin/pedidos",        label: "Pedidos",        icon: ShoppingBag },
  { href: "/admin/reportes",       label: "Reportes",       icon: BarChart2 },
  { href: "/admin/menu",           label: "Menú",           icon: UtensilsCrossed },
  { href: "/admin/categorias",     label: "Categorías",     icon: Tag },
  { href: "/admin/clientes",       label: "Clientes",       icon: Users },
  { href: "/admin/zonas",          label: "Zonas",          icon: Tag },
  { href: "/admin/mesas",          label: "Mesas QR",       icon: QrCode },
  { href: "/admin/cupones",        label: "Cupones",        icon: Ticket },
  { href: "/admin/resenas",        label: "Reseñas",        icon: Star },
  { href: "/admin/banners",        label: "Banners",        icon: Image },
  { href: "/admin/configuracion",  label: "Configuración",  icon: Settings },
];

function playSound() {
  try {
    const ctx = new AudioContext();
    const play = () => {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "sine"; osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.14;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.5, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.start(t); osc.stop(t + 0.35);
      });
    };
    ctx.state === "suspended" ? ctx.resume().then(play) : play();
  } catch { /* sin audio */ }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const knownIds = useRef<Set<string>>(new Set());
  const firstLoad = useRef(true);

  // Resetear badge al entrar a pedidos
  useEffect(() => {
    if (pathname.startsWith("/admin/pedidos")) {
      setNewOrdersCount(0);
    }
  }, [pathname]);

  // Suscripción global a nuevos pedidos
  useEffect(() => {
    const supabase = createClient();

    const loadInitial = async () => {
      const { data } = await supabase
        .from("orders")
        .select("id")
        .neq("status", "delivered")
        .neq("status", "cancelled")
        .order("created_at", { ascending: false })
        .limit(100);
      (data ?? []).forEach((o: { id: string }) => knownIds.current.add(o.id));
      firstLoad.current = false;
    };

    const handleNewOrders = async () => {
      if (firstLoad.current) return;
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, total")
        .neq("status", "delivered")
        .neq("status", "cancelled")
        .order("created_at", { ascending: false })
        .limit(100);

      const incoming = data ?? [];
      const newOnes = incoming.filter((o: { id: string }) => !knownIds.current.has(o.id));

      newOnes.forEach((o: { id: string; order_number: string; customer_name: string; total: number }) => {
        knownIds.current.add(o.id);

        // Solo incrementar badge si NO estamos en pedidos
        if (!pathname.startsWith("/admin/pedidos")) {
          setNewOrdersCount((c) => c + 1);
        }

        // Sonido
        playSound();

        // Notificación OS
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(`🛎️ Nuevo pedido ${o.order_number}`, {
            body: `${o.customer_name} · $${(o.total ?? 0).toLocaleString("es-CO")}`,
            icon: "/logo-real.png",
            tag: "nuevo-pedido",
            requireInteraction: true,
          });
        }

        // Toast global (visible desde cualquier sección)
        toast.custom(
          (t) => (
            <div className={`flex items-center gap-3 bg-[#1A1B21] border-2 border-[#D4A017] rounded-2xl px-4 py-3 shadow-xl ${t.visible ? "animate-enter" : "animate-leave"}`}>
              <div className="w-9 h-9 rounded-full bg-[#D4A017]/20 flex items-center justify-center shrink-0">
                <ShoppingBag size={18} className="text-[#D4A017]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">¡Nuevo pedido! {o.order_number}</p>
                <p className="text-[#CCCCCC] text-xs truncate">{o.customer_name} · ${(o.total ?? 0).toLocaleString("es-CO")}</p>
              </div>
              <Link
                href="/admin/pedidos"
                onClick={() => toast.dismiss(t.id)}
                className="shrink-0 bg-[#D4A017] hover:bg-[#E8B830] text-[#111217] font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
              >
                Ver
              </Link>
              <button onClick={() => toast.dismiss(t.id)} className="text-[#555566] hover:text-white text-lg leading-none shrink-0">×</button>
            </div>
          ),
          { duration: 20000, position: "top-right" }
        );
      });
    };

    loadInitial();

    const channel = supabase
      .channel("admin-layout-orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, handleNewOrders)
      .subscribe();

    const interval = setInterval(handleNewOrders, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const NavItems = ({ onClose }: { onClose?: () => void }) => (
    <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
      {navLinks.map(({ href, label, icon: Icon }) => {
        const isActive = href === "/admin"
          ? pathname === "/admin"
          : pathname.startsWith(href);
        const isPedidos = href === "/admin/pedidos";
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
              isActive
                ? "bg-[#D4A017]/15 text-[#D4A017] font-semibold"
                : "text-[#CCCCCC] hover:text-[#D4A017] hover:bg-[#D4A017]/10"
            }`}
          >
            <div className="relative shrink-0">
              <Icon size={18} className={isActive ? "text-[#D4A017]" : "text-[#888899]"} />
              {isPedidos && newOrdersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 animate-pulse">
                  {newOrdersCount > 9 ? "9+" : newOrdersCount}
                </span>
              )}
            </div>
            <span className="flex-1">{label}</span>
            {isPedidos && newOrdersCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                {newOrdersCount > 9 ? "9+" : newOrdersCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#111217] flex">

      {/* ── DESKTOP sidebar ── */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-[#1A1B21] border-r border-[#2E3038] sticky top-0 h-screen self-start">
        <div className="p-5 border-b border-[#2E3038]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center shrink-0">
              <NextImage src="/logo-real.png" alt="ParillaBurgers" width={44} height={38} className="brightness-0 invert" />
            </div>
            <div>
              <p className="text-[#F5F0E8] font-bold text-sm">ParillaBurgers</p>
              <p className="text-[#888899] text-xs">Panel Admin</p>
            </div>
          </div>
        </div>
        <NavItems />
        <div className="p-4 border-t border-[#2E3038] space-y-1">
          <Link href="/" className="flex items-center gap-2 text-[#888899] hover:text-[#CCCCCC] text-xs transition-colors py-1">
            <ArrowLeft size={14} /> Ver sitio
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="flex items-center gap-2 text-[#888899] hover:text-red-400 text-xs transition-colors py-1 w-full">
              <LogOut size={14} /> Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* ── MOBILE overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── MOBILE drawer ── */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#1A1B21] border-r border-[#2E3038] flex flex-col z-50 transition-transform duration-300 lg:hidden ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="p-5 border-b border-[#2E3038] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center shrink-0">
              <NextImage src="/logo-real.png" alt="ParillaBurgers" width={44} height={38} className="brightness-0 invert" />
            </div>
            <div>
              <p className="text-[#F5F0E8] font-bold text-sm">ParillaBurgers</p>
              <p className="text-[#888899] text-xs">Panel Admin</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-[#888899] hover:text-[#F5F0E8] p-1">
            <X size={20} />
          </button>
        </div>
        <NavItems onClose={() => setSidebarOpen(false)} />
        <div className="p-4 border-t border-[#2E3038] space-y-1">
          <Link href="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 text-[#888899] hover:text-[#CCCCCC] text-xs transition-colors py-1">
            <ArrowLeft size={14} /> Ver sitio
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="flex items-center gap-2 text-[#888899] hover:text-red-400 text-xs transition-colors py-1 w-full">
              <LogOut size={14} /> Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 h-14 bg-[#1A1B21] border-b border-[#2E3038] sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-[#CCCCCC] hover:text-[#D4A017] hover:bg-[#D4A017]/10 transition-colors relative"
          >
            <Menu size={20} />
            {newOrdersCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>
          <p className="text-[#F5F0E8] font-bold text-sm flex-1">
            {navLinks.find(l => l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href))?.label ?? "Admin"}
          </p>
          {newOrdersCount > 0 && (
            <Link href="/admin/pedidos" className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
              <ShoppingBag size={12} /> {newOrdersCount} nuevo{newOrdersCount > 1 ? "s" : ""}
            </Link>
          )}
        </div>

        <div className="p-4 lg:p-8 min-w-0 w-full">
          <div className="overflow-x-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
