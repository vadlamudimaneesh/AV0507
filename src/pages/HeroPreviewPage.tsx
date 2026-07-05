import { useState } from "react";
import { Link } from "react-router-dom";
import { SiteShell } from "@/components/SiteShell";
import { HERO_PANORAMA_URL } from "@/lib/data-store";

export const HERO_OPTION_CHOICES = [
  {
    file: "/hero-options/gen-01-rajasthani-palace.webp",
    preview: "/hero-options/gen-01-rajasthani-palace-preview.jpg",
    title: "Rajasthani Palace Villa",
    mood: "Jaisalmer stone · Jali arches · Brass diyas · Courtyard",
    blurb: "Grand palace-inspired living room — ornate carved sandstone pillars, jewel-tone silk diwans, brass chandelier, and courtyard glimpse through pointed arches.",
    recommended: true,
  },
  {
    file: "/hero-options/gen-02-kerala-tharavad.webp",
    preview: "/hero-options/gen-02-kerala-tharavad-preview.jpg",
    title: "Kerala Tharavad Mansion",
    mood: "Carved teak · Lotus courtyard · Kerala murals",
    blurb: "Nalukettu-style double-height open hall — hand-carved teak ceilings, lotus pond courtyard, Kerala murals, brass lamps, and tropical garden views.",
  },
  {
    file: "/hero-options/gen-03-contemporary-penthouse.webp",
    preview: "/hero-options/gen-03-contemporary-penthouse-preview.jpg",
    title: "Contemporary Indian Penthouse",
    mood: "City skyline · Marble · Brass ring chandelier · Mezzanine",
    blurb: "Ultra-luxury double-height urban penthouse — floor-to-ceiling city views, Makrana marble, floating staircase, brass chandelier, Indian art and jaali screens.",
  },
  {
    file: "/hero-options/gen-04-mughal-grand.webp",
    preview: "/hero-options/gen-04-mughal-grand-preview.jpg",
    title: "Mughal Grand Hall",
    mood: "Marble jali · Fountain · Royal dining · Gold plasterwork",
    blurb: "Palatial Mughal-inspired hall — pietra dura marble, Athangudi-tiled floors, ornate gold ceiling, fountain centrepiece, and long royal dining for twelve.",
  },
  {
    file: "/hero-options/gen-05-biophilic-fusion.webp",
    preview: "/hero-options/gen-05-biophilic-fusion-preview.jpg",
    title: "Biophilic Indian Fusion",
    mood: "Living wall · Skylight · Tribal screens · Kitchen open-plan",
    blurb: "Modern Indian open-plan with a 5-metre living green wall, Ganesha accents, Kilim rugs, copper pendants over kitchen island, floating staircase, and brass balustrade.",
  },
] as const;

export function HeroPreviewPage() {
  const [active, setActive] = useState(0);
  const choice = HERO_OPTION_CHOICES[active];

  return (
    <SiteShell>
      <section className="container-editorial py-16 md:py-24">
        <div className="max-w-3xl">
          <div className="eyebrow">Hero selection · Luxury Indian villas</div>
          <h1 className="mt-4 font-serif text-4xl md:text-6xl">5 AI-generated Indian interiors</h1>
          <p className="mt-6 text-foreground/70 leading-relaxed">
            Five custom-generated luxury Indian villa 360° panoramas — Rajasthani palace, Kerala tharavad, contemporary penthouse, Mughal grand hall, and biophilic fusion. All generated at <strong>8192 × 4096 quality 95</strong> with lanczos3 sharpening.
            To apply one, copy the file command shown below and run it in your terminal.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Active hero: <code className="text-xs">{HERO_PANORAMA_URL}</code>
          </p>
        </div>

        <div className="mt-12 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <div className="aspect-[2/1] overflow-hidden bg-muted border border-border/60 relative">
              <img src={choice.preview} alt={choice.title} className="w-full h-full object-cover" />
              {"recommended" in choice && choice.recommended && (
                <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[10px] uppercase tracking-widest px-2 py-1">
                  Recommended
                </span>
              )}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{choice.blurb}</p>
            <div className="mt-6 p-4 border border-border/60 bg-muted/30 text-sm space-y-2">
              <div><span className="text-accent uppercase tracking-widest text-xs">Apply</span></div>
              <code className="block text-xs break-all whitespace-pre-wrap">
                {`copy "public${choice.file.replace(/\//g, "\\")}" "public\\hero-panorama.webp"`}
              </code>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            {HERO_OPTION_CHOICES.map((opt, i) => (
              <button
                key={opt.file}
                onClick={() => setActive(i)}
                className={`w-full text-left border p-4 transition-colors ${
                  active === i ? "border-accent bg-accent/5" : "border-border/60 hover:border-accent/50"
                }`}
              >
                <div className="flex gap-4">
                  <img src={opt.preview} alt="" className="w-24 h-16 object-cover shrink-0 bg-muted" />
                  <div>
                    <div className="font-serif text-lg">{opt.title}</div>
                    <div className="text-xs text-accent mt-1">{opt.mood}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 flex gap-6">
          <Link to="/" className="text-sm border-b border-foreground pb-1 hover:text-accent">← Back to home hero</Link>
        </div>
      </section>
    </SiteShell>
  );
}
