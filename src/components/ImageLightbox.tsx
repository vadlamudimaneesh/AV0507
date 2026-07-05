import { useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type GalleryImage = { src: string; title: string; category?: string };

type ImageLightboxProps = {
  images: GalleryImage[];
  index: number;
  onClose: () => void;
  onChange: (index: number) => void;
};

export function ImageLightbox({ images, index, onClose, onChange }: ImageLightboxProps) {
  const current = images[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onChange(Math.max(0, index - 1));
      if (e.key === "ArrowRight") onChange(Math.min(images.length - 1, index + 1));
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, images.length, onChange, onClose]);

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col" role="dialog" aria-modal="true">
      <div className="flex items-center justify-between p-4 text-white/80">
        <div>
          <div className="text-sm">{current.title}</div>
          {current.category && <div className="text-xs uppercase tracking-widest text-white/50">{current.category}</div>}
        </div>
        <button onClick={onClose} aria-label="Close lightbox" className="p-2 hover:text-white">
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 relative">
        <button
          onClick={() => onChange(Math.max(0, index - 1))}
          disabled={index === 0}
          className="absolute left-4 p-2 text-white/70 hover:text-white disabled:opacity-30"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
        <img src={current.src} alt={current.title} className="max-h-[75vh] max-w-full object-contain" />
        <button
          onClick={() => onChange(Math.min(images.length - 1, index + 1))}
          disabled={index === images.length - 1}
          className="absolute right-4 p-2 text-white/70 hover:text-white disabled:opacity-30"
          aria-label="Next image"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      </div>
      <div className="p-4 text-center text-xs text-white/50">
        {index + 1} / {images.length}
      </div>
    </div>
  );
}
