import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = path.join(process.cwd(), "public", "hero-options");

/** CC0 equirectangular panoramas from Poly Haven — lavish / luxury / modern / spacious */
export const HERO_OPTIONS = [
  {
    file: "01-glasshouse-modern.webp",
    id: "glasshouse_interior",
    title: "Glasshouse Interior",
    mood: "Modern · Minimal · Ultra-spacious",
    blurb: "Floor-to-ceiling glass, open volume, contemporary architecture — ideal for a high-end studio brand.",
  },
  {
    file: "02-cayley-luxury-living.webp",
    id: "cayley_interior",
    title: "Cayley Luxury Living",
    mood: "Luxury · Bright · Panoramic views",
    blurb: "Sunlit living room with glass doors and balcony views — warm, upscale residential feel.",
  },
  {
    file: "03-hotel-suite.webp",
    id: "hotel_room",
    title: "Boutique Hotel Suite",
    mood: "Luxury · Hospitality · Refined",
    blurb: "Polished hotel interior with rich materials — sophisticated and immediately upscale.",
  },
  {
    file: "04-anniversary-lounge.webp",
    id: "anniversary_lounge",
    title: "Anniversary Lounge",
    mood: "Lavish · Entertaining · Spacious",
    blurb: "Generous lounge with elegant lighting — perfect for interiors-focused firms.",
  },
  {
    file: "05-solitude-modern-retreat.webp",
    id: "solitude_interior",
    title: "Solitude Modern Retreat",
    mood: "Modern · Serene · Architectural",
    blurb: "Calm, architecturally composed interior — quiet luxury with strong spatial clarity.",
  },
];

function pickPanoramaUrl(meta) {
  if (meta.tonemapped?.url) return meta.tonemapped.url;
  return null;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const opt of HERO_OPTIONS) {
    console.log(`\n→ ${opt.title} (${opt.id})`);
    const meta = await fetch(`https://api.polyhaven.com/files/${opt.id}`).then((r) => r.json());
    const url = pickPanoramaUrl(meta);
    if (!url) throw new Error(`No tonemapped URL for ${opt.id}`);

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Download failed ${opt.id}: ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());

    const outPath = path.join(OUT_DIR, opt.file);
    await sharp(buffer, { unlimited: true })
      .resize(8192, 4096, { fit: "fill" })
      .webp({ quality: 90, effort: 4 })
      .toFile(outPath);

    const previewPath = path.join(OUT_DIR, opt.file.replace(".webp", "-preview.jpg"));
    await sharp(buffer, { unlimited: true })
      .resize(8192, 4096, { fit: "fill" })
      .extract({ left: 2048, top: 1024, width: 4096, height: 2048 })
      .jpeg({ quality: 88 })
      .toFile(previewPath);

    const mb = (fs.statSync(outPath).size / 1024 / 1024).toFixed(1);
    console.log(`  Saved ${opt.file} (${mb} MB)`);
  }

  console.log(`\nDone — 5 options in ${OUT_DIR}`);
  console.log("Preview at http://localhost:5173/hero-preview");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
