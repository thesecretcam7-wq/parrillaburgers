import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0F1117] lg:bg-[#07080C]">
      <Navbar />
      <div className="pt-14 pb-20 lg:max-w-[430px] lg:mx-auto lg:border-x lg:border-[#2E3038] lg:bg-[#0F1117] lg:min-h-[calc(100vh-56px-64px)]">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
