/**
 * Stitches Indian room images with cross-fade blending at seams.
 * Each strip has a 120px gradient fade on both left and right edges,
 * and strips are overlapped by 120px so seams dissolve smoothly.
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ASSETS = "C:/Users/manee/.cursor/projects/c-Users-manee-Desktop-av0507/assets/";
const OUT = path.join(process.cwd(), "public", "hero-panorama.webp");

const IMAGES = [
  "indian-room-foyer.png",
  "indian-room-dining.png",
  "indian-room-kitchen.png",
  "indian-room-courtyard.png",
  "indian-room-office.png",
  "indian-room-bedroom.png",
  "indian-room-pooja.png",
];

const FINAL_W = 4096;
const FINAL_H = 2048;
const N = IMAGES.length;

const SRC_W = 1536;
const SRC_H = 1024;

// Crop centre 55% of each source image
const CROP_W = Math.floor(SRC_W * 0.55); // 844
const CROP_X = Math.floor((SRC_W - CROP_W) / 2); // 346

// Each strip's visible (non-blended) width in the final canvas
const STEP = Math.floor(FINAL_W / N); // ~585

// How many pixels of overlap on each side for the cross-fade
const FADE = 100;

// Full strip width including both fade zones
const STRIP_W = STEP + FADE * 2;

// ─── Build a horizontal gradient mask (PNG RGBA) ─────────────────────────────
// Pixel alpha: 0 at x=0, ramps to 255 at x=FADE, holds 255, ramps back to 0
async function buildMask(w, h) {
  const buf = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const off = (y * w + x) * 4;
      let alpha;
      if (x < FADE) {
        alpha = Math.round((x / FADE) * 255);
      } else if (x > w - FADE) {
        alpha = Math.round(((w - x) / FADE) * 255);
      } else {
        alpha = 255;
      }
      buf[off] = 255;
      buf[off + 1] = 255;
      buf[off + 2] = 255;
      buf[off + 3] = alpha;
    }
  }
  return sharp(buf, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toBuffer();
}

async function processStrip(file) {
  // 1. Centre-crop source
  // 2. Resize to STRIP_W × FINAL_H (raw pixels for the strip)
  return sharp(ASSETS + file)
    .extract({ left: CROP_X, top: 0, width: CROP_W, height: SRC_H })
    .resize(STRIP_W, FINAL_H, { fit: "fill" })
    .png()
    .toBuffer();
}

async function main() {
  console.log(`Building ${N}-room panorama with cross-fade blending…`);
  console.log(`  Strip width: ${STRIP_W}px  |  Step: ${STEP}px  |  Fade: ${FADE}px`);

  // Pre-build the alpha mask (same shape for all strips)
  console.log("  Generating fade mask…");
  const mask = await buildMask(STRIP_W, FINAL_H);

  // Process all strips in parallel
  const stripBuffers = await Promise.all(
    IMAGES.map(async (file, i) => {
      process.stdout.write(`  [${i + 1}/${N}] ${file} … `);

      const strip = await processStrip(file);

      // Apply the alpha gradient mask so the strip fades at both edges
      const masked = await sharp(strip)
        .composite([{ input: mask, blend: "dest-in" }])
        .png()
        .toBuffer();

      console.log("ok");
      return masked;
    })
  );

  // Canvas: each strip starts at i*STEP (overlap by 2*FADE = 200px total seam zone)
  const canvasW = STEP * N + FADE * 2; // a little extra for the last strip's right fade

  const composites = stripBuffers.map((input, i) => ({
    input,
    left: Math.max(0, i * STEP - FADE),
    top: 0,
    blend: "over",
  }));

  console.log(`Compositing onto ${canvasW}×${FINAL_H} canvas…`);

  await sharp({
    create: {
      width: canvasW,
      height: FINAL_H,
      channels: 3,
      background: { r: 240, g: 228, b: 210 },
    },
  })
    .composite(composites)
    .resize(FINAL_W, FINAL_H, { fit: "fill" })
    .sharpen({ sigma: 0.5 })
    .webp({ quality: 90, effort: 4 })
    .toFile(OUT);

  const mb = (fs.statSync(OUT).size / 1024 / 1024).toFixed(2);
  console.log(`\n✓  ${OUT}  (${mb} MB)  ${FINAL_W}×${FINAL_H}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
