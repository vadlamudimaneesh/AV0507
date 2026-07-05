import { useState } from "react";
import { Link } from "react-router-dom";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/SiteShell";
import { projectsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

type Filter = "all" | "interiors" | "facades";

export function PortfolioPage() {
  const { data: projects } = useSuspenseQuery(projectsQuery());
  const [filter, setFilter] = useState<Filter>("all");
  const filtered = filter === "all" ? projects : projects.filter((p) => p.category === filter);

  return (
    <SiteShell>
      <section className="container-editorial py-16 md:py-24">
        <div className="max-w-3xl">
          <div className="eyebrow">Portfolio</div>
          <h1 className="mt-4 font-serif text-5xl md:text-7xl leading-[0.95]">
            Selected work,<br /><span className="italic text-accent">2018 — 2025</span>
          </h1>
        </div>
        <div className="mt-12 flex gap-8 border-b border-border/60 pb-4 text-sm">
          {(["all", "interiors", "facades"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "tracking-wide uppercase text-xs pb-1 transition-colors border-b -mb-[17px]",
                filter === f ? "text-accent border-accent" : "text-muted-foreground border-transparent hover:text-foreground",
              )}
            >
              {f === "all" ? "All work" : f}
            </button>
          ))}
        </div>
        <div className="mt-12 grid gap-x-8 gap-y-16 md:grid-cols-2">
          {filtered.map((p) => (
            <Link key={p.id} to={`/portfolio/${p.slug}`} className="group">
              <div className="overflow-hidden bg-muted aspect-[4/5]">
                {p.cover_image && <img src={p.cover_image} alt={p.title} className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105" />}
              </div>
              <div className="mt-5 flex justify-between items-baseline">
                <div>
                  <div className="eyebrow">{p.category}</div>
                  <h3 className="font-serif text-2xl mt-2 group-hover:text-accent transition-colors">{p.title}</h3>
                </div>
                <div className="text-xs text-muted-foreground">{p.year}</div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{p.location}</p>
            </Link>
          ))}
          {filtered.length === 0 && <p className="text-muted-foreground">No projects yet.</p>}
        </div>
      </section>
    </SiteShell>
  );
}

export function CategoryPage({ category }: { category: "interiors" | "facades" }) {
  const { data: projects } = useSuspenseQuery(projectsQuery(category));
  const title = category === "interiors" ? "Interiors" : "Façades";

  return (
    <SiteShell>
      <section className="container-editorial py-16 md:py-24">
        <div className="max-w-3xl">
          <div className="eyebrow">{title}</div>
          <h1 className="mt-4 font-serif text-5xl md:text-7xl leading-[0.95]">{title}</h1>
          <p className="mt-6 text-lg text-foreground/70 max-w-xl leading-relaxed">
            {category === "interiors"
              ? "Spaces shaped by light, material and the quiet choreography of daily life."
              : "Building skins that speak to street, sky and the passage of seasons."}
          </p>
        </div>
        <div className="mt-16 grid gap-x-8 gap-y-16 md:grid-cols-2">
          {projects.map((p) => (
            <Link key={p.id} to={`/portfolio/${p.slug}`} className="group">
              <div className="overflow-hidden bg-muted aspect-[4/5]">
                {p.cover_image && <img src={p.cover_image} alt={p.title} className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />}
              </div>
              <h3 className="font-serif text-2xl mt-5 group-hover:text-accent">{p.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{p.location} · {p.year}</p>
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
