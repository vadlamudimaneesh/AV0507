import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const POLYHAVEN_IDS = ["brown_photostudio_02", "studio_small_09", "anniversary_lounge"];
const OUT_PATH = path.join(process.cwd(), "public", "hero-panorama.webp");
const FALLBACK_URL = "https://pannellum.org/images/alma.jpg";

function pickPanoramaUrl(meta) {
  if (meta.tonemapped?.url) return meta.tonemapped.url;
  const hdri = meta.hdri;
  if (!hdri) return null;
  for (const size of ["8k", "4k", "2k", "1k"]) {
    const entry = hdri[size];
    if (entry?.hdr?.url) return entry.hdr.url;
    if (entry?.exr?.url) return entry.exr.url;
  }
  return null;
}

async function downloadPolyhaven() {
  for (const id of POLYHAVEN_IDS) {
    console.log(`Trying Poly Haven asset: ${id}…`);
    const metaRes = await fetch(`https://api.polyhaven.com/files/${id}`);
    if (!metaRes.ok) continue;
    const meta = await metaRes.json();
    const url = pickPanoramaUrl(meta);
    if (url) return { url, id };
  }
  throw new Error("No Poly Haven asset available");
}

async function main() {
  let sourceUrl = FALLBACK_URL;
  let sourceLabel = "pannellum fallback";

  try {
    const { url, id } = await downloadPolyhaven();
    sourceUrl = url;
    sourceLabel = `Poly Haven / ${id}`;
  } catch (err) {
    console.warn("Poly Haven unavailable:", err.message);
    console.warn("Using pannellum equirectangular fallback.");
  }

  console.log(`Downloading from ${sourceLabel}…`);
  const res = await fetch(sourceUrl);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());

  console.log("Processing to 8192×4096 WebP (true equirectangular 360°)…");
  await sharp(buffer, { unlimited: true })
    .resize(8192, 4096, { fit: "fill" })
    .webp({ quality: 90, effort: 4 })
    .toFile(OUT_PATH);

  const stats = fs.statSync(OUT_PATH);
  console.log(`Saved ${OUT_PATH} (${(stats.size / 1024 / 1024).toFixed(1)} MB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
