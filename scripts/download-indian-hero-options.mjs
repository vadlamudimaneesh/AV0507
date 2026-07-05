import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = path.join(process.cwd(), "public", "hero-options");

/** CC / PD sources — Indian architecture & heritage homes */
export const INDIAN_HERO_OPTIONS = [
  {
    file: "in-01-jorasanko-thakurbari.webp",
    title: "Jorasanko Thakur Bari",
    mood: "Heritage · Bengali Haveli · Courtyard mansion",
    blurb: "18th-century Tagore family ancestral home — red oxide floors, courtyards, carved timber. True 360°.",
    bestFor: "Traditional Indian residential heritage",
    type: "wikimedia",
    wikiTitle: "File:Jorasanko Thakur Bari Complex - 360 Degree Equirectangular View - Kolkata 2015-08-04 1746-1752.tif",
  },
  {
    file: "in-02-bichitra-bhavan-interior.webp",
    title: "Bichitra Bhavan Interior",
    mood: "Heritage · Interior · Colonial-Bengali",
    blurb: "First-floor interior of the Thakur Bari complex — warm wood, period rooms, Indian aristocratic home. True 360°.",
    bestFor: "Heritage interiors practice",
    type: "wikimedia",
    wikiTitle: "File:First Floor Interior - 360 Degree Equirectangular View - Bichitra Bhavan - Jorasanko Thakur Bari - Kolkata 2015-08-04 1681-1687.tif",
  },
  {
    file: "in-03-patwon-haveli-jaisalmer.webp",
    title: "Patwon Ki Haveli, Jaisalmer",
    mood: "Rajasthan · Haveli · Ornate sandstone",
    blurb: "Intricate jali work, golden sandstone arches — classic Rajasthani merchant haveli interior.",
    bestFor: "Facades + traditional Rajasthani craft",
    type: "wrap",
    sourceUrl: "https://images.pexels.com/photos/37298595/pexels-photo-37298595.jpeg?auto=compress&cs=tinysrgb&w=8000",
  },
  {
    file: "in-04-athangudi-chettinad-palace.webp",
    title: "Athangudi Chettinad Palace",
    mood: "South India · Chettinad · Tile craft",
    blurb: "Athangudi palace hall with iconic handmade tile floors and Chettinad columns — lavish South Indian style.",
    bestFor: "Luxury South Indian interiors",
    type: "wrap",
    sourceUrl: "https://images.pexels.com/photos/19872528/pexels-photo-19872528.jpeg?auto=compress&cs=tinysrgb&w=8000",
  },
  {
    file: "in-05-modern-indian-living.webp",
    title: "Modern Indian Living Room",
    mood: "Contemporary · Spacious · Indo-modern",
    blurb: "Bright, open contemporary Indian home with warm neutrals, wood and soft daylight — modern residential luxury.",
    bestFor: "Modern Indian villa / apartment projects",
    type: "wrap",
    sourceUrl: "https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=8000",
  },
];

async function wikiImageUrl(title) {
  const fileName = title.replace(/^File:/, "");
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;
}

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "MollerRydeArchitectureSite/1.0 (local dev; hero panorama download)" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function wrapToEquirectangular(buffer, outPath) {
  const meta = await sharp(buffer).metadata();
  const srcW = meta.width ?? 4000;
  const srcH = meta.height ?? 3000;

  const outW = 8192;
  const outH = 4096;
  const bandH = Math.round(outH * 0.52);
  const topPad = Math.round((outH - bandH) / 2);

  const resized = await sharp(buffer)
    .resize(outW, bandH, { fit: "cover", position: "centre" })
    .toBuffer();

  const topFill = await sharp(buffer)
    .resize(outW, topPad, { fit: "cover", position: "top" })
    .blur(28)
    .modulate({ brightness: 0.72 })
    .toBuffer();

  const bottomH = outH - bandH - topPad;

  const bottomFill = await sharp(buffer)
    .resize(outW, bottomH, { fit: "cover", position: "bottom" })
    .blur(28)
    .modulate({ brightness: 0.72 })
    .toBuffer();

  await sharp({
    create: { width: outW, height: outH, channels: 3, background: { r: 24, g: 20, b: 18 } },
  })
    .composite([
      { input: topFill, top: 0, left: 0 },
      { input: resized, top: topPad, left: 0 },
      { input: bottomFill, top: topPad + bandH, left: 0 },
    ])
    .webp({ quality: 88, effort: 4 })
    .toFile(outPath);
}

function outPad(outH, bandH, topPad) {
  return outH - bandH - topPad;
}

async function saveWebp(buffer, outPath) {
  await sharp(buffer, { unlimited: true, limitInputPixels: false })
    .resize(8192, 4096, { fit: "fill" })
    .webp({ quality: 88, effort: 4 })
    .toFile(outPath);

  const previewPath = outPath.replace(".webp", "-preview.jpg");
  await sharp(outPath)
    .extract({ left: 2048, top: 1024, width: 4096, height: 2048 })
    .jpeg({ quality: 88 })
    .toFile(previewPath);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const opt of INDIAN_HERO_OPTIONS) {
    console.log(`\n→ ${opt.title}`);
    const outPath = path.join(OUT_DIR, opt.file);

    if (opt.type === "wikimedia") {
      const url = await wikiImageUrl(opt.wikiTitle);
      console.log("  Downloading Wikimedia 360° (large file, please wait)…");
      const buffer = await fetchBuffer(url);
      await saveWebp(buffer, outPath);
    } else {
      console.log("  Downloading reference photo…");
      const buffer = await fetchBuffer(opt.sourceUrl);
      console.log("  Wrapping to equirectangular 360°…");
      await wrapToEquirectangular(buffer, outPath);
      const previewPath = outPath.replace(".webp", "-preview.jpg");
      await sharp(outPath)
        .extract({ left: 2048, top: 1024, width: 4096, height: 2048 })
        .jpeg({ quality: 88 })
        .toFile(previewPath);
    }

    const mb = (fs.statSync(outPath).size / 1024 / 1024).toFixed(1);
    console.log(`  Saved ${opt.file} (${mb} MB)`);
  }

  console.log(`\nDone — Indian options in ${OUT_DIR}`);
  console.log("Preview: http://localhost:5173/hero-preview");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
