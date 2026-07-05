import { useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/SiteShell";
import { ImageLightbox } from "@/components/ImageLightbox";
import { projectsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

type Filter = "all" | "interiors" | "facades";

export function GalleryPage() {
  const { data: projects } = useSuspenseQuery(projectsQuery());
  const [filter, setFilter] = useState<Filter>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const images = useMemo(() => {
    const list: { src: string; title: string; category: string }[] = [];
    for (const p of projects) {
      if (filter !== "all" && p.category !== filter) continue;
      if (p.cover_image) list.push({ src: p.cover_image, title: p.title, category: p.category });
      for (const g of p.gallery ?? []) list.push({ src: g, title: p.title, category: p.category });
    }
    return list;
  }, [projects, filter]);

  return (
    <SiteShell>
      <section className="container-editorial py-16 md:py-24">
        <div className="max-w-3xl">
          <div className="eyebrow">Index</div>
          <h1 className="mt-4 font-serif text-5xl md:text-7xl">Gallery</h1>
          <p className="mt-6 max-w-xl text-foreground/70 text-lg leading-relaxed">
            Fragments and full views — a visual index of the practice's completed work.
          </p>
        </div>

        <div className="mt-12 flex gap-8 border-b border-border/60 pb-4">
          {(["all", "interiors", "facades"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "tracking-wide uppercase text-xs pb-1 transition-colors border-b -mb-[17px]",
                filter === f ? "text-accent border-accent" : "text-muted-foreground border-transparent hover:text-foreground",
              )}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>

        <div className="mt-16 columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6 [column-fill:balance]">
          {images.map((img, i) => (
            <button
              key={`${img.src}-${i}`}
              onClick={() => setLightboxIndex(i)}
              className="mb-4 md:mb-6 break-inside-avoid overflow-hidden bg-muted w-full text-left"
            >
              <img src={img.src} alt={img.title} loading="lazy" className="w-full h-auto block hover:opacity-90 transition-opacity" />
            </button>
          ))}
          {images.length === 0 && <p className="text-muted-foreground">No images yet.</p>}
        </div>
      </section>

      {lightboxIndex !== null && (
        <ImageLightbox images={images} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onChange={setLightboxIndex} />
      )}
    </SiteShell>
  );
}
