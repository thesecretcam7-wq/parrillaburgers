import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import { Toaster } from "react-hot-toast";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ParillaBurgers – El mejor sabor a la parrilla",
  description: "Hamburguesas artesanales a la parrilla. Pide online, sigue tu pedido en tiempo real y acumula puntos con cada compra.",
  keywords: ["hamburguesas", "delivery", "parrilla", "burgers"],
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "ParillaBurgers" },
};

export const viewport: Viewport = {
  themeColor: "#D4A017",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/logo.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js'))}` }} />
      </head>
      <body className={`${geist.variable} antialiased bg-[#F4F4F5] text-[#111217]`}>
        <Navbar />
        <div className="pt-14 pb-20">{children}</div>
        <BottomNav />
        <Toaster
          position="top-center"
          toastOptions={{
            style: { background: "#fff", color: "#111217", border: "1px solid #E4E4E7", borderRadius: "12px", fontSize: "14px", fontWeight: 500 },
            success: { iconTheme: { primary: "#D4A017", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
