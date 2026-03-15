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

const MAX_RETRIES = 3;

function buildPollinationsUrl(prompt: string) {
  const seed = Math.floor(Math.random() * 999999);
  const encoded = encodeURIComponent(prompt.trim());
  // No model= param → Pollinations picks the most available model automatically
  return `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&nologo=true&seed=${seed}`;
}

export default function ImageUpload({ value, onChange, aiHint }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  // AI panel state
  const [showAI, setShowAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [pollinationsUrl, setPollinationsUrl] = useState<string | null>(null);
  const [aiImgLoading, setAiImgLoading] = useState(false);
  const [aiImgError, setAiImgError] = useState(false);
  const [aiUploading, setAiUploading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

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

  const startGeneration = (prompt: string, retry = 0) => {
    const url = buildPollinationsUrl(prompt);
    setPollinationsUrl(url);
    setAiImgLoading(true);
    setAiImgError(false);
    setRetryCount(retry);
  };

  const handleGenerate = () => {
    if (!aiPrompt.trim()) { toast.error("Escribe una descripción primero"); return; }
    startGeneration(aiPrompt);
  };

  // Auto-retry on error, up to MAX_RETRIES, then show error state
  const handleImgError = () => {
    if (retryCount < MAX_RETRIES) {
      // Retry silently with a new seed
      setTimeout(() => startGeneration(aiPrompt, retryCount + 1), 800);
    } else {
      setAiImgLoading(false);
      setAiImgError(true);
    }
  };

  const handleUseAI = async () => {
    if (!pollinationsUrl) return;
    setAiUploading(true);
    try {
      const imgRes = await fetch(pollinationsUrl);
      if (!imgRes.ok) throw new Error("No se pudo descargar la imagen generada");
      const blob = await imgRes.blob();
      const file = new File([blob], `ai-${Date.now()}.jpg`, { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(json.error ?? "Error al subir");
      onChange(json.url);
      setShowAI(false);
      setPollinationsUrl(null);
      toast.success("Imagen aplicada ✓");
    } catch (err: any) {
      toast.error(err.message ?? "Error al aplicar la imagen");
    } finally {
      setAiUploading(false);
    }
  };

  const toggleAI = () => {
    const next = !showAI;
    setShowAI(next);
    if (next && aiHint && !aiPrompt) setAiPrompt(aiHint);
    if (!next) { setPollinationsUrl(null); setAiImgError(false); }
  };

  const handleRegenerate = () => {
    if (!aiPrompt.trim()) return;
    startGeneration(aiPrompt);
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
            className="w-full bg-[#22242C] border border-[#2E3038] rounded-lg px-3 py-2 text-white text-xs placeholder-[#4B5563] resize-none focus:outline-none focus:border-[#D4A017]/50 leading-relaxed"
          />

          <div className="flex items-center justify-between">
            <span className="text-[#4B5563] text-[10px]">{aiPrompt.length}/500</span>
            <button type="button" onClick={handleGenerate} disabled={aiImgLoading || !aiPrompt.trim()}
              className="flex items-center gap-1.5 bg-[#D4A017] text-[#0F1117] text-xs font-bold px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E8B830] transition-colors">
              {aiImgLoading
                ? <><Loader2 size={13} className="animate-spin" />Generando...</>
                : <><Sparkles size={13} />Generar imagen</>}
            </button>
          </div>

          {/* Preview */}
          {pollinationsUrl && (
            <div className="space-y-2 pt-1 border-t border-[#2E3038]">
              <div className="flex items-center justify-between">
                <p className="text-[#9CA3AF] text-[10px]">Vista previa:</p>
                {aiImgLoading && retryCount > 0 && (
                  <p className="text-[#6B7280] text-[10px]">Reintento {retryCount}/{MAX_RETRIES}...</p>
                )}
              </div>

              <div className="relative w-full h-32 rounded-lg overflow-hidden border border-[#2E3038] bg-[#22242C] flex items-center justify-center">
                {aiImgError ? (
                  /* No <img> in DOM when error → prevents infinite onError loop */
                  <div className="flex flex-col items-center gap-2 px-4 text-center">
                    <p className="text-red-400 text-xs">No se pudo generar la imagen.</p>
                    <p className="text-[#6B7280] text-[10px]">El servicio está ocupado. Pulsa 🔄 para intentar de nuevo.</p>
                  </div>
                ) : (
                  <>
                    {aiImgLoading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 bg-[#22242C]">
                        <Loader2 size={24} className="text-[#D4A017] animate-spin" />
                        <p className="text-[#6B7280] text-[10px]">Generando imagen (~15-25s)...</p>
                      </div>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pollinationsUrl}
                      alt="Imagen generada por IA"
                      className={`w-full h-full object-cover transition-opacity duration-300 ${aiImgLoading ? "opacity-0" : "opacity-100"}`}
                      onLoad={() => { setAiImgLoading(false); setRetryCount(0); }}
                      onError={handleImgError}
                      crossOrigin="anonymous"
                    />
                  </>
                )}
              </div>

              <div className="flex gap-2">
                {!aiImgLoading && !aiImgError && (
                  <button type="button" onClick={handleUseAI} disabled={aiUploading}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#D4A017] text-[#0F1117] text-xs font-bold px-3 py-2 rounded-lg hover:bg-[#E8B830] transition-colors disabled:opacity-60">
                    {aiUploading
                      ? <><Loader2 size={12} className="animate-spin" />Guardando...</>
                      : "Usar esta imagen"}
                  </button>
                )}
                <button type="button" onClick={handleRegenerate} disabled={aiUploading || aiImgLoading} title="Reintentar"
                  className="flex items-center gap-1.5 bg-[#22242C] border border-[#2E3038] text-[#9CA3AF] px-3 py-2 rounded-lg hover:text-white hover:border-[#D4A017]/30 transition-colors disabled:opacity-50 text-xs">
                  <RefreshCw size={13} />
                  {aiImgError ? "Reintentar" : ""}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
