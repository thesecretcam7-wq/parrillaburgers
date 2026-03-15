import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ParillaBurgers – El mejor sabor a la parrilla",
  description:
    "Hamburguesas artesanales a la parrilla. Pide online, sigue tu pedido en tiempo real y acumula puntos con cada compra.",
  keywords: ["hamburguesas", "delivery", "Medellín", "parrilla", "burgers"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geist.variable} antialiased bg-[#111217] text-[#F5F0E8]`}>
        <Navbar />
        <div className="pt-16">{children}</div>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#22232B",
              color: "#F5F0E8",
              border: "1px solid #2E3038",
            },
            success: {
              iconTheme: { primary: "#D4A017", secondary: "#111217" },
            },
          }}
        />
      </body>
    </html>
  );
}
