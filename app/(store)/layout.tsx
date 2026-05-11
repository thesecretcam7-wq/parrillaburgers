"use client";

import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import FloatingWhatsApp from "@/components/layout/FloatingWhatsApp";
import { pageVariants, pageTransition } from "@/lib/animations";

export default function StoreLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          className="min-h-screen pb-24"
        >
          {children}
        </motion.div>
      </AnimatePresence>
      <BottomNav />
      <FloatingWhatsApp />
    </div>
  );
}
