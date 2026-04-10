import type { Metadata, Viewport } from "next";
import { Geist, Dancing_Script } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  weight: ["600", "700"],
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
        <meta name="facebook-domain-verification" content="jpc16938ql46tlzsf3vbvciu6hoagy" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js'))}` }} />
      </head>
      <body className={`${geist.variable} ${dancingScript.variable} antialiased bg-[#0F1117] text-white`}>
        <Script id="meta-pixel" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
          (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','1275466108111185');
          fbq('track','PageView');
        `}} />
        {children}
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
