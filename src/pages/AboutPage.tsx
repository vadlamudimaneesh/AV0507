import { SiteShell } from "@/components/SiteShell";

const TEAM = [
  { name: "Ida Møller", role: "Founding Partner", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80" },
  { name: "Jonas Ryde", role: "Founding Partner", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80" },
  { name: "Astrid Lund", role: "Head of Interiors", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80" },
  { name: "Mateo Reyes", role: "Head of Façades", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80" },
];

const AWARDS = [
  { year: "2024", title: "AR House Award", note: "Willow House, Copenhagen" },
  { year: "2024", title: "Dezeen Awards, Longlist", note: "Kestrel Tower, Rotterdam" },
  { year: "2023", title: "Wallpaper* Design Award", note: "Atelier Marais, Paris" },
  { year: "2022", title: "RIBA International Prize, Nominee", note: "Nordhavn Pavilion" },
  { year: "2020", title: "AJ Small Projects, Winner", note: "Sea-house, Skagen" },
];

const SERVICES = ["Interiors", "Façades", "Consultation"];

export function AboutPage() {
  return (
    <SiteShell>
      <section className="container-editorial py-16 md:py-24 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-5">
          <div className="eyebrow">Studio</div>
          <h1 className="mt-4 font-serif text-5xl md:text-7xl leading-[0.95]">A quiet<br />practice.</h1>
        </div>
        <div className="md:col-span-6 md:col-start-7 space-y-6 text-foreground/80 text-lg leading-relaxed">
          <p>Møller & Ryde is a small architecture studio founded in Copenhagen in 2004. We work at every scale — from the door handle to the city block — because architecture is one continuous act of care.</p>
          <p>We believe good buildings are built slowly, and that the strongest gesture is often the most restrained one.</p>
        </div>
      </section>

      <section className="container-editorial py-16 border-t border-border/60">
        <div className="eyebrow">Services</div>
        <div className="mt-6 flex flex-wrap gap-4">
          {SERVICES.map((s) => (
            <span key={s} className="border border-border/60 px-4 py-2 text-sm">{s}</span>
          ))}
        </div>
      </section>

      <section className="container-editorial py-16 md:py-24 border-t border-border/60">
        <div className="eyebrow">Team</div>
        <h2 className="mt-4 font-serif text-4xl md:text-5xl">People</h2>
        <div className="mt-12 grid gap-8 grid-cols-2 md:grid-cols-4">
          {TEAM.map((m) => (
            <div key={m.name}>
              <div className="aspect-[3/4] overflow-hidden bg-muted">
                <img src={m.image} alt={m.name} className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
              </div>
              <div className="mt-4 font-serif text-xl">{m.name}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">{m.role}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-editorial py-16 md:py-24 border-t border-border/60">
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <div className="eyebrow">Recognition</div>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl">Awards</h2>
          </div>
          <ul className="md:col-span-7 md:col-start-6 divide-y divide-border/60">
            {AWARDS.map((a) => (
              <li key={a.title} className="grid grid-cols-[80px_1fr] gap-6 py-6 items-baseline">
                <span className="text-accent text-sm">{a.year}</span>
                <div>
                  <div className="font-serif text-xl">{a.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">{a.note}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </SiteShell>
  );
}
