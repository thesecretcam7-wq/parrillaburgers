"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, LogIn } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Correo o contraseña incorrectos");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#0F1117] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logo-real.png"
            alt="ParillaBurgers"
            width={120}
            height={93}
            priority
            className="brightness-0 invert"
          />
        </div>

        <div className="bg-[#1A1B21] border border-[#2E3038] rounded-2xl p-6">
          <h1 className="text-[#F5F0E8] font-black text-xl mb-1">Panel Admin</h1>
          <p className="text-[#888899] text-sm mb-6">Ingresa con tu cuenta de administrador</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[#CCCCCC] text-sm font-medium mb-1.5">
                Correo
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-[#111217] border border-[#2E3038] rounded-xl px-4 py-3 text-[#F5F0E8] text-sm focus:outline-none focus:border-[#D4A017] transition-colors"
                placeholder="admin@parrillaburgers.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[#CCCCCC] text-sm font-medium mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full bg-[#111217] border border-[#2E3038] rounded-xl px-4 py-3 pr-11 text-[#F5F0E8] text-sm focus:outline-none focus:border-[#D4A017] transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888899] hover:text-[#CCCCCC] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#D4A017] text-[#0F1117] font-bold py-3 rounded-xl hover:bg-[#E8B830] transition-colors disabled:opacity-50 mt-2"
            >
              <LogIn size={16} />
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
