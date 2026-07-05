import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const FRAME_COUNT = 60;
const WIDTH = 1920;
const HEIGHT = 1080;
const OUT_DIR = path.join(process.cwd(), "public", "hero-frames");

// Use the locally generated biophilic panorama; fall back to Unsplash if missing
const LOCAL_PANORAMA = path.join(process.cwd(), "public", "hero-panorama.webp");
const FALLBACK_URL =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=4800&q=90";

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let buffer;
  if (fs.existsSync(LOCAL_PANORAMA)) {
    console.log("Using local hero-panorama.webp…");
    buffer = fs.readFileSync(LOCAL_PANORAMA);
  } else {
    console.log("Downloading fallback panorama…");
    const res = await fetch(FALLBACK_URL);
    buffer = Buffer.from(await res.arrayBuffer());
  }
  const meta = await sharp(buffer).metadata();
  const srcW = meta.width ?? 4800;
  const srcH = meta.height ?? 3200;

  const cropW = Math.floor(srcW * 0.45);
  const maxLeft = srcW - cropW;

  console.log(`Generating ${FRAME_COUNT} frames…`);
  for (let i = 0; i < FRAME_COUNT; i++) {
    const left = Math.round((i / (FRAME_COUNT - 1)) * maxLeft);
    const name = `frame-${String(i + 1).padStart(3, "0")}.webp`;
    await sharp(buffer)
      .extract({ left, top: 0, width: cropW, height: srcH })
      .resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" })
      .webp({ quality: 78 })
      .toFile(path.join(OUT_DIR, name));
    if ((i + 1) % 10 === 0) console.log(`  ${i + 1}/${FRAME_COUNT}`);
  }
  console.log(`Done. Frames saved to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
