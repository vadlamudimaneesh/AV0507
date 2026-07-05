import { Link } from "react-router-dom";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { ScrollScrubHero } from "@/components/ScrollScrubHero";
import { projectsQuery } from "@/lib/queries";

export function HomePage() {
  const { data: projects } = useSuspenseQuery(projectsQuery());
  const featured = projects.filter((p) => p.featured).slice(0, 3);
  const display = featured.length > 0 ? featured : projects.slice(0, 3);

  return (
    <SiteShell transparentHeader>
      <ScrollScrubHero />

      <section className="py-24 md:py-32">
        <div className="container-editorial">
          <div className="flex items-end justify-between mb-16">
            <div>
              <div className="eyebrow">Selected work</div>
              <h2 className="mt-4 font-serif text-4xl md:text-5xl">Featured projects</h2>
            </div>
            <Link to="/portfolio" className="hidden md:inline-flex items-center gap-2 text-sm border-b border-foreground/40 pb-1 hover:text-accent hover:border-accent">
              All projects <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-12 md:gap-16 md:grid-cols-2">
            {display.map((p, i) => (
              <Link key={p.id} to={`/portfolio/${p.slug}`} className={`group block ${i === 0 ? "md:col-span-2" : ""}`}>
                <div className="overflow-hidden bg-muted aspect-[4/3] md:aspect-[16/10]">
                  {p.cover_image && (
                    <img src={p.cover_image} alt={p.title} className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
                  )}
                </div>
                <div className="mt-5 flex items-baseline justify-between gap-4">
                  <div>
                    <div className="eyebrow">{p.category}</div>
                    <h3 className="font-serif text-2xl md:text-3xl mt-2 group-hover:text-accent transition-colors">{p.title}</h3>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">{p.location} · {p.year}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 border-t border-border/60">
        <div className="container-editorial grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <div className="eyebrow">Practice</div>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl leading-tight">Two disciplines,<br />one sensibility.</h2>
          </div>
          <div className="md:col-span-6 md:col-start-7 text-foreground/75 text-base md:text-lg leading-relaxed space-y-6">
            <p>Our work spans two closely-related disciplines. In the interior, we sculpt light, tactility and quiet detail. On the façade, we compose mass, rhythm and material at the scale of the street.</p>
            <p>The same values run through both: honest materials, patient craft, and buildings that grow more beautiful with age.</p>
            <div className="pt-4 flex gap-8">
              <Link to="/interiors" className="text-sm border-b border-foreground pb-1 hover:text-accent hover:border-accent">Interiors →</Link>
              <Link to="/facades" className="text-sm border-b border-foreground pb-1 hover:text-accent hover:border-accent">Façades →</Link>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
