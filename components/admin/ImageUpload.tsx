"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

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
    </div>
  );
}
