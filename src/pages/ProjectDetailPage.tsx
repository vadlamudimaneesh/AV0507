import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/SiteShell";
import { ImageLightbox } from "@/components/ImageLightbox";
import { projectBySlugQuery, projectsQuery } from "@/lib/queries";

export function ProjectDetailPage() {
  const { slug = "" } = useParams();
  const { data: project } = useSuspenseQuery(projectBySlugQuery(slug));
  const { data: allProjects } = useSuspenseQuery(projectsQuery());
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!project) {
    return (
      <SiteShell>
        <div className="container-editorial py-24">
          <h1 className="font-serif text-4xl">Project not found</h1>
          <Link to="/portfolio" className="mt-6 inline-block text-accent">← Back to portfolio</Link>
        </div>
      </SiteShell>
    );
  }

  const images = [project.cover_image, ...(project.gallery ?? [])].filter(Boolean) as string[];
  const related = allProjects.filter((p) => p.id !== project.id && p.category === project.category).slice(0, 2);
  const lightboxImages = images.map((src) => ({ src, title: project.title, category: project.category }));

  return (
    <SiteShell>
      <section className="container-editorial py-12 md:py-16">
        <Link to="/portfolio" className="text-sm text-muted-foreground hover:text-accent">← Portfolio</Link>
        <div className="mt-8 grid md:grid-cols-12 gap-12">
          <div className="md:col-span-7">
            <div className="overflow-hidden bg-muted aspect-[4/3]">
              {project.cover_image && <img src={project.cover_image} alt={project.title} className="w-full h-full object-cover" />}
            </div>
            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {images.slice(1).map((src, i) => (
                  <button key={i} onClick={() => setLightboxIndex(i + 1)} className="overflow-hidden bg-muted aspect-square">
                    <img src={src} alt="" className="w-full h-full object-cover hover:opacity-90" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="md:col-span-5">
            <div className="eyebrow">{project.category}</div>
            <h1 className="mt-4 font-serif text-4xl md:text-6xl">{project.title}</h1>
            <p className="mt-4 text-muted-foreground">{project.location} · {project.year}</p>
            {project.short_description && <p className="mt-8 text-lg leading-relaxed">{project.short_description}</p>}
            {project.long_description && <p className="mt-6 text-foreground/75 leading-relaxed">{project.long_description}</p>}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-editorial py-16 border-t border-border/60">
          <div className="eyebrow">Related</div>
          <h2 className="mt-4 font-serif text-3xl">More {project.category}</h2>
          <div className="mt-10 grid md:grid-cols-2 gap-8">
            {related.map((p) => (
              <Link key={p.id} to={`/portfolio/${p.slug}`} className="group">
                <div className="overflow-hidden bg-muted aspect-[16/10]">
                  {p.cover_image && <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                </div>
                <h3 className="font-serif text-xl mt-4 group-hover:text-accent">{p.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {lightboxIndex !== null && (
        <ImageLightbox images={lightboxImages} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onChange={setLightboxIndex} />
      )}
    </SiteShell>
  );
}
