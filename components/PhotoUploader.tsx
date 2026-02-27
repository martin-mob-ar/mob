"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  X,
  Star,
  GripVertical,
  Loader2,
  AlertCircle,
  ImagePlus,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface UploadedPhoto {
  storagePath: string;
  publicUrl: string;
  order: number;
  isCover: boolean;
}

interface PhotoUploaderProps {
  propertyId?: number;
  photos: UploadedPhoto[];
  onChange: (photos: UploadedPhoto[]) => void;
}

interface UploadingFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  error?: string;
}

const MIN_WIDTH = 1200;
const MIN_HEIGHT = 800;
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function validateImageDimensions(
  file: File
): Promise<{ valid: boolean; width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve({
        valid: img.naturalWidth >= MIN_WIDTH && img.naturalHeight >= MIN_HEIGHT,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve({ valid: false, width: 0, height: 0 });
    };
    img.src = URL.createObjectURL(file);
  });
}

// ─── Sortable Photo Card ────────────────────────────────────────────────────

interface SortablePhotoProps {
  photo: UploadedPhoto;
  index: number;
  onRemove: (index: number) => void;
  onSetCover: (index: number) => void;
  isDragOverlay?: boolean;
}

function SortablePhoto({ photo, index, onRemove, onSetCover, isDragOverlay }: SortablePhotoProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.storagePath });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragOverlay) {
    return (
      <div className="relative rounded-2xl overflow-hidden border-2 border-primary shadow-2xl scale-105 rotate-2">
        <div className="aspect-[4/3] relative">
          <Image src={photo.publicUrl} alt={`Foto ${index + 1}`} fill sizes="200px" className="object-cover" />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group rounded-2xl overflow-hidden border-2 transition-all",
        photo.isCover ? "border-primary ring-2 ring-primary/20" : "border-border",
        isDragging ? "opacity-30 scale-95" : "opacity-100"
      )}
    >
      {/* Cover label — top, full width */}
      {photo.isCover && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest text-center py-0.5">
          Portada
        </div>
      )}

      <div className="aspect-[4/3] relative">
        <Image
          src={photo.publicUrl}
          alt={`Foto ${index + 1}`}
          fill
          sizes="(max-width: 640px) 50vw, 200px"
          className="object-cover"
        />
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Drag handle — always visible as a subtle grip, stronger on hover */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 h-8 w-8 rounded-xl bg-black/40 group-hover:bg-black/70 backdrop-blur-sm flex items-center justify-center cursor-grab active:cursor-grabbing transition-colors touch-none"
      >
        <GripVertical className="h-4 w-4 text-white/70 group-hover:text-white" />
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-xl bg-black/40 hover:bg-red-600 backdrop-blur-sm flex items-center justify-center cursor-pointer"
      >
        <X className="h-4 w-4 text-white" />
      </button>

      {/* Bottom bar — cover toggle + order number */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {!photo.isCover ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSetCover(index);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-[11px] font-medium hover:bg-primary transition-colors cursor-pointer"
          >
            <Star className="h-3 w-3" />
            Portada
          </button>
        ) : (
          <div />
        )}
        <div className="h-6 min-w-6 px-1.5 rounded-md bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <span className="text-white text-[11px] font-bold">{index + 1}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function PhotoUploader({
  propertyId,
  photos,
  onChange,
}: PhotoUploaderProps) {
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // dnd-kit sensors — pointer with activation distance to avoid accidental drags
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const addError = (msg: string) => {
    setErrors((prev) => [...prev, msg]);
    setTimeout(() => setErrors((prev) => prev.slice(1)), 5000);
  };

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArr = Array.from(files);

      for (const file of fileArr) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          addError(`"${file.name}" — Solo JPEG, PNG o WebP.`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          addError(`"${file.name}" — Excede 15MB.`);
          continue;
        }

        const dims = await validateImageDimensions(file);
        if (!dims.valid) {
          addError(
            `"${file.name}" — ${dims.width}x${dims.height}px. Mínimo ${MIN_WIDTH}x${MIN_HEIGHT}px.`
          );
          continue;
        }

        const uploadId = crypto.randomUUID();
        const preview = URL.createObjectURL(file);
        setUploading((prev) => [
          ...prev,
          { id: uploadId, file, preview, progress: 0 },
        ]);

        try {
          const order = photos.length;
          const signedRes = await fetch("/api/photos/signed-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              propertyId: propertyId || 0,
              order,
              contentType: file.type,
            }),
          });

          if (!signedRes.ok) throw new Error("No se pudo obtener URL de subida");

          const { signedUrl, storagePath, publicUrl } = await signedRes.json();

          setUploading((prev) =>
            prev.map((u) => (u.id === uploadId ? { ...u, progress: 40 } : u))
          );

          const uploadRes = await fetch(signedUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
          });

          if (!uploadRes.ok) throw new Error("Error al subir a Google Cloud");

          setUploading((prev) =>
            prev.map((u) => (u.id === uploadId ? { ...u, progress: 100 } : u))
          );

          const newPhoto: UploadedPhoto = {
            storagePath,
            publicUrl,
            order: photos.length,
            isCover: photos.length === 0,
          };

          onChange([...photos, newPhoto]);
          setUploading((prev) => prev.filter((u) => u.id !== uploadId));
          URL.revokeObjectURL(preview);
        } catch (err) {
          setUploading((prev) =>
            prev.map((u) =>
              u.id === uploadId
                ? {
                    ...u,
                    error:
                      err instanceof Error ? err.message : "Error de subida",
                  }
                : u
            )
          );
        }
      }
    },
    [photos, propertyId, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = "";
    }
  };

  const removePhoto = async (index: number) => {
    const photo = photos[index];
    try {
      await fetch("/api/photos/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storagePath: photo.storagePath }),
      });
    } catch {
      // Continue even if GCS delete fails
    }

    const updated = photos.filter((_, i) => i !== index);
    const reordered = updated.map((p, i) => ({
      ...p,
      order: i,
      isCover: i === 0 && !updated.some((u) => u.isCover && u !== p) ? true : p.isCover,
    }));

    if (reordered.length > 0 && !reordered.some((p) => p.isCover)) {
      reordered[0].isCover = true;
    }

    onChange(reordered);
  };

  const removeUploading = (id: string) => {
    setUploading((prev) => {
      const item = prev.find((u) => u.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((u) => u.id !== id);
    });
  };

  const setCover = (index: number) => {
    onChange(photos.map((p, i) => ({ ...p, isCover: i === index })));
  };

  // ─── dnd-kit handlers ──────────────────────────────────────────────────

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = photos.findIndex((p) => p.storagePath === active.id);
    const newIndex = photos.findIndex((p) => p.storagePath === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(photos, oldIndex, newIndex).map((p, i) => ({
      ...p,
      order: i,
    }));
    onChange(reordered);
  };

  const activePhoto = activeId
    ? photos.find((p) => p.storagePath === activeId)
    : null;

  const hasPhotos = photos.length > 0 || uploading.length > 0;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h1 className="font-display text-3xl font-bold">Fotos</h1>
        <p className="text-muted-foreground text-sm">
          Mínimo {MIN_WIDTH}x{MIN_HEIGHT}px · JPEG, PNG o WebP · Hasta 15MB
        </p>
      </div>

      {/* ── Errors ─────────────────────────────────────────────────── */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm animate-in fade-in slide-in-from-top-1 duration-200"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Drop zone ──────────────────────────────────────────────── */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "w-full rounded-3xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-2",
          hasPhotos ? "py-8" : "aspect-[3/2] py-8",
          dragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border hover:border-primary/50 bg-secondary/10 hover:bg-secondary/20"
        )}
      >
        <div
          className={cn(
            "rounded-2xl bg-secondary flex items-center justify-center transition-all",
            hasPhotos ? "h-11 w-11" : "h-14 w-14"
          )}
        >
          {hasPhotos ? (
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Camera className="h-7 w-7 text-muted-foreground" />
          )}
        </div>
        <div className="text-center">
          <p className="font-display font-semibold uppercase tracking-wider text-sm">
            {hasPhotos ? "Agregar más fotos" : "Subí fotos de tu propiedad"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Arrastrá archivos acá o tocá para buscar
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* ── Photo grid (sortable) ──────────────────────────────────── */}
      {hasPhotos && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              {photos.length} {photos.length === 1 ? "foto" : "fotos"}
            </p>
            {photos.length > 1 && (
              <p className="text-xs text-muted-foreground">
                Arrastrá para reordenar
              </p>
            )}
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={photos.map((p) => p.storagePath)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((photo, index) => (
                  <SortablePhoto
                    key={photo.storagePath}
                    photo={photo}
                    index={index}
                    onRemove={removePhoto}
                    onSetCover={setCover}
                  />
                ))}

                {/* Uploading items */}
                {uploading.map((item) => (
                  <div
                    key={item.id}
                    className="relative rounded-2xl overflow-hidden border-2 border-border animate-in fade-in zoom-in-95 duration-300"
                  >
                    <div className="aspect-[4/3] relative">
                      <img
                        src={item.preview}
                        alt="Subiendo..."
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
                        {item.error ? (
                          <>
                            <AlertCircle className="h-6 w-6 text-red-400" />
                            <p className="text-xs text-red-300 text-center px-3 leading-tight">
                              {item.error}
                            </p>
                            <button
                              onClick={() => removeUploading(item.id)}
                              className="text-[11px] text-white/80 underline underline-offset-2 hover:text-white cursor-pointer"
                            >
                              Eliminar
                            </button>
                          </>
                        ) : (
                          <>
                            <Loader2 className="h-6 w-6 text-white animate-spin" />
                            <div className="w-20 h-1.5 rounded-full bg-white/20 overflow-hidden">
                              <div
                                className="h-full bg-white rounded-full transition-all duration-500"
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SortableContext>

            {/* Drag overlay — the ghost that follows the cursor */}
            <DragOverlay adjustScale={false}>
              {activePhoto ? (
                <div className="w-[160px]">
                  <SortablePhoto
                    photo={activePhoto}
                    index={photos.findIndex(
                      (p) => p.storagePath === activePhoto.storagePath
                    )}
                    onRemove={() => {}}
                    onSetCover={() => {}}
                    isDragOverlay
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}
    </div>
  );
}
