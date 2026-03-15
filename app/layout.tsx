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
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "ParillaBurgers" },
};

export const viewport: Viewport = {
  themeColor: "#0F1117",
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
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js'))}` }} />
      </head>
      <body className={`${geist.variable} antialiased bg-[#0F1117] text-white`}>
        <Navbar />
        <div className="pt-14 pb-20 lg:pb-6">{children}</div>
        <BottomNav />
        <Toaster
          position="top-center"
          toastOptions={{
            style: { background: "#1A1B21", color: "#fff", border: "1px solid #2E3038", borderRadius: "12px", fontSize: "14px", fontWeight: 500 },
            success: { iconTheme: { primary: "#D4A017", secondary: "#1A1B21" } },
          }}
        />
      </body>
    </html>
  );
}
