"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, ImageIcon, Loader2, Sparkles, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  aiHint?: string;
}

export default function ImageUpload({ value, onChange, aiHint }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  // AI panel state
  const [showAI, setShowAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState(""); // status message while generating
  const [aiPreview, setAiPreview] = useState<string | null>(null); // Supabase URL after generation

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Solo se permiten imágenes"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("La imagen no puede pesar más de 5MB"); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error al subir");
      onChange(json.url);
      toast.success("Imagen subida ✓");
    } catch (err: any) {
      toast.error(err.message ?? "Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  // Generate via Hugging Face (server-side) — reliable, ~5-10s
  const handleGenerate = async (retryCount = 0) => {
    if (!aiPrompt.trim()) { toast.error("Escribe una descripción primero"); return; }
    setAiLoading(true);
    setAiPreview(null);
    setAiStatus(retryCount > 0 ? "El modelo está iniciando, reintentando..." : "Generando imagen...");

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt.trim() }),
      });
      const json = await res.json();

      // Model cold start (503 with retry flag) — wait 20s and retry once
      if (!res.ok && json.retry && retryCount < 2) {
        setAiStatus("El modelo está iniciando (~20s)...");
        setTimeout(() => handleGenerate(retryCount + 1), 20000);
        return;
      }

      if (!res.ok) throw new Error(json.error ?? "Error al generar");

      setAiPreview(json.url);
    } catch (err: any) {
      toast.error(err.message ?? "Error al generar la imagen");
      setAiLoading(false);
      setAiStatus("");
    } finally {
      if (aiPreview !== null || !aiLoading) {
        setAiLoading(false);
        setAiStatus("");
      }
    }
  };

  // When generation succeeds, stop loading
  const onGenerateDone = (url: string) => {
    setAiPreview(url);
    setAiLoading(false);
    setAiStatus("");
  };

  const handleUseAI = () => {
    if (!aiPreview) return;
    onChange(aiPreview);
    setShowAI(false);
    setAiPreview(null);
    toast.success("Imagen aplicada ✓");
  };

  const toggleAI = () => {
    const next = !showAI;
    setShowAI(next);
    if (next && aiHint && !aiPrompt) setAiPrompt(aiHint);
    if (!next) { setAiPreview(null); setAiLoading(false); setAiStatus(""); }
  };

  return (
    <div className="space-y-2">
      <label className="text-[#CCCCCC] text-xs block">Imagen del producto</label>

      {value ? (
        <div className="relative w-full h-40 rounded-xl overflow-hidden border border-[#2E3038] group">
          <Image src={value} alt="Preview" fill className="object-cover" unoptimized />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button type="button" onClick={() => inputRef.current?.click()}
              className="bg-[#D4A017] text-[#111217] text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5">
              <Upload size={13} /> Cambiar
            </button>
            <button type="button" onClick={() => onChange("")}
              className="bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5">
              <X size={13} /> Quitar
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`w-full h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
            dragging ? "border-[#D4A017] bg-[#D4A017]/10" : "border-[#2E3038] hover:border-[#D4A017]/50 hover:bg-[#D4A017]/5"
          } ${uploading ? "pointer-events-none opacity-70" : ""}`}
        >
          {uploading ? (
            <><Loader2 size={28} className="text-[#D4A017] animate-spin" /><p className="text-[#888899] text-xs">Subiendo imagen...</p></>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-[#22232B] flex items-center justify-center">
                <ImageIcon size={20} className="text-[#888899]" />
              </div>
              <p className="text-[#CCCCCC] text-xs font-medium">Haz clic o arrastra una imagen aquí</p>
              <p className="text-[#555566] text-[10px]">JPG, PNG o WebP · máx 5MB</p>
            </>
          )}
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
        onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFile(file); e.target.value = ""; }}
      />

      {/* AI toggle */}
      <button type="button" onClick={toggleAI}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#22242C] border border-[#D4A017]/25 text-[#D4A017] text-xs font-semibold hover:bg-[#2A2414] hover:border-[#D4A017]/50 transition-all">
        <span className="flex items-center gap-1.5"><Sparkles size={13} />Generar con IA · gratis</span>
        {showAI ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {/* AI panel */}
      {showAI && (
        <div className="rounded-xl border border-[#2E3038] bg-[#16181F] p-3 space-y-3">
          <p className="text-[#9CA3AF] text-[10px]">
            Describe la imagen. <span className="text-[#D4A017]/70">Tip: en inglés da mejores resultados.</span>
          </p>

          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Ej: juicy burger with melted cheese, fresh lettuce and tomato, dark elegant background..."
            rows={3}
            maxLength={500}
            disabled={aiLoading}
            className="w-full bg-[#22242C] border border-[#2E3038] rounded-lg px-3 py-2 text-white text-xs placeholder-[#4B5563] resize-none focus:outline-none focus:border-[#D4A017]/50 leading-relaxed disabled:opacity-60"
          />

          <div className="flex items-center justify-between">
            <span className="text-[#4B5563] text-[10px]">{aiPrompt.length}/500</span>
            <button type="button" onClick={() => handleGenerate()} disabled={aiLoading || !aiPrompt.trim()}
              className="flex items-center gap-1.5 bg-[#D4A017] text-[#0F1117] text-xs font-bold px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E8B830] transition-colors">
              {aiLoading
                ? <><Loader2 size={13} className="animate-spin" />{aiStatus || "Generando..."}</>
                : <><Sparkles size={13} />Generar imagen</>}
            </button>
          </div>

          {/* Preview */}
          {aiPreview && (
            <div className="space-y-2 pt-1 border-t border-[#2E3038]">
              <p className="text-[#9CA3AF] text-[10px]">Vista previa:</p>
              <div className="relative w-full h-32 rounded-lg overflow-hidden border border-[#2E3038]">
                <Image src={aiPreview} alt="Imagen generada" fill className="object-cover" unoptimized />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={handleUseAI}
                  className="flex-1 bg-[#D4A017] text-[#0F1117] text-xs font-bold px-3 py-2 rounded-lg hover:bg-[#E8B830] transition-colors">
                  Usar esta imagen
                </button>
                <button type="button" onClick={() => handleGenerate()} disabled={aiLoading} title="Regenerar"
                  className="bg-[#22242C] border border-[#2E3038] text-[#9CA3AF] px-3 py-2 rounded-lg hover:text-white hover:border-[#D4A017]/30 transition-colors disabled:opacity-50">
                  <RefreshCw size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
