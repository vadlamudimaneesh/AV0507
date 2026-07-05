import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = path.join(process.cwd(), "public", "hero-options");
const HERO_PATH = path.join(process.cwd(), "public", "hero-panorama.webp");

/**
 * Best free CC0 open-plan / multi-zone residential 360° captures (Poly Haven).
 * None include every element (stairs + chandelier + all rooms) — see HERO_PANORAMA_GUIDE.md for custom renders.
 */
export const VILLA_HERO_OPTIONS = [
  {
    file: "villa-01-glasshouse-open-plan.webp",
    id: "glasshouse_interior",
    title: "Glasshouse Open Plan",
    mood: "Living · Kitchen · Dining · Fireplace",
    blurb: "Best free match: single 360° from an open residential volume — kitchen, dining table and living visible as you rotate. Large windows, spacious.",
    recommended: true,
  },
  {
    file: "villa-02-cayley-modern-living.webp",
    id: "cayley_interior",
    title: "Cayley Modern Living",
    mood: "Double-height · Glass · Drawing area",
    blurb: "Sunlit modern living with glass doors and balcony — strong drawing/living zone, open and bright.",
  },
  {
    file: "villa-03-lythwood-open-plan.webp",
    id: "lythwood_room",
    title: "Lythwood Open Plan",
    mood: "Urban · Open layout · Soft daylight",
    blurb: "Open-plan living/bedroom layout — low contrast, contemporary apartment feel.",
  },
  {
    file: "villa-04-hotel-luxury-suite.webp",
    id: "hotel_room",
    title: "Luxury Suite",
    mood: "Chandelier · Refined · Spacious",
    blurb: "Upscale interior with chandelier-style lighting and premium finishes — luxury villa mood.",
  },
  {
    file: "villa-05-anniversary-lounge.webp",
    id: "anniversary_lounge",
    title: "Grand Open Lounge",
    mood: "Lavish · Entertaining · Double volume",
    blurb: "Large entertaining lounge — drawing-room scale, elegant lighting, generous space.",
  },
];

function pickTonemappedUrl(meta) {
  return meta.tonemapped?.url ?? null;
}

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "MollerRydeArchitectureSite/1.0 (hero panorama download)" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function savePanorama(buffer, outPath) {
  await sharp(buffer, { unlimited: true, limitInputPixels: false })
    .resize(8192, 4096, { fit: "fill" })
    .webp({ quality: 90, effort: 4 })
    .toFile(outPath);

  const previewPath = outPath.replace(".webp", "-preview.jpg");
  await sharp(outPath)
    .extract({ left: 2048, top: 1024, width: 4096, height: 2048 })
    .jpeg({ quality: 88 })
    .toFile(previewPath);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  let recommendedPath = null;

  for (const opt of VILLA_HERO_OPTIONS) {
    console.log(`\n→ ${opt.title} (${opt.id})`);
    const meta = await fetch(`https://api.polyhaven.com/files/${opt.id}`).then((r) => r.json());
    const url = pickTonemappedUrl(meta);
    if (!url) throw new Error(`No tonemapped URL for ${opt.id}`);

    const buffer = await fetchBuffer(url);
    const outPath = path.join(OUT_DIR, opt.file);
    await savePanorama(buffer, outPath);
    if (opt.recommended) recommendedPath = outPath;

    const mb = (fs.statSync(outPath).size / 1024 / 1024).toFixed(1);
    console.log(`  Saved ${opt.file} (${mb} MB)`);
  }

  if (recommendedPath) {
    fs.copyFileSync(recommendedPath, HERO_PATH);
    console.log(`\n✓ Applied recommended hero → public/hero-panorama.webp`);
  }

  console.log("\nPreview: http://localhost:5173/hero-preview");
  console.log("For your exact villa (stairs + all rooms): read docs/HERO_PANORAMA_GUIDE.md");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
