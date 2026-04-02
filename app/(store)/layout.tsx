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
    <div className="min-h-screen bg-[#0F1117] lg:bg-[#07080C]">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          className="pt-14 pb-20 lg:max-w-[430px] lg:mx-auto lg:border-x lg:border-[#2E3038] lg:bg-[#0F1117] lg:min-h-[calc(100vh-56px-64px)]"
        >
          {children}
        </motion.div>
      </AnimatePresence>
      <BottomNav />
      <FloatingWhatsApp />
    </div>
  );
}
