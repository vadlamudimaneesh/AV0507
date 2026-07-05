/**
 * Builds a web-ready equirectangular hero from a generated or reference flat/wide interior image.
 * For true 360 quality, prefer an AI output explicitly in 2:1 equirectangular format.
 *
 * Usage:
 *   node scripts/apply-custom-hero.mjs path/to/image.png [--wrap] [--name slug]
 *   node scripts/apply-custom-hero.mjs assets/reference.png --wrap --name rajasthani-haveli
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OUT_W = 8192;
const OUT_H = 4096;
const HERO = path.join(process.cwd(), "public", "hero-panorama.webp");
const OPTIONS = path.join(process.cwd(), "public", "hero-options");

/** Sharpen after upscale to recover detail lost in bilinear interpolation */
async function sharpenUpscaled(buf) {
  return sharp(buf)
    .sharpen({ sigma: 1.4, m1: 1.0, m2: 2.0, x1: 2, y2: 10, y3: 20 })
    .toBuffer();
}

async function wrapToEquirectangular(inputPath) {
  const buffer = fs.readFileSync(inputPath);
  const bandH = Math.round(OUT_H * 0.60);
  const topPad = Math.round((OUT_H - bandH) / 2);
  const bottomH = OUT_H - bandH - topPad;

  const rawBand = await sharp(buffer)
    .resize(OUT_W, bandH, { fit: "cover", position: "centre", kernel: "lanczos3" })
    .toBuffer();
  const band = await sharpenUpscaled(rawBand);

  const top = await sharp(buffer)
    .resize(OUT_W, topPad, { fit: "cover", position: "top", kernel: "lanczos3" })
    .blur(18)
    .modulate({ brightness: 0.6 })
    .toBuffer();
  const bottom = await sharp(buffer)
    .resize(OUT_W, bottomH, { fit: "cover", position: "bottom", kernel: "lanczos3" })
    .blur(18)
    .modulate({ brightness: 0.6 })
    .toBuffer();

  return sharp({
    create: { width: OUT_W, height: OUT_H, channels: 3, background: { r: 20, g: 18, b: 16 } },
  })
    .composite([
      { input: top, top: 0, left: 0 },
      { input: band, top: topPad, left: 0 },
      { input: bottom, top: topPad + bandH, left: 0 },
    ])
    .webp({ quality: 95, effort: 6 })
    .toBuffer();
}

async function fillEquirectangular(inputPath) {
  const raw = await sharp(inputPath, { unlimited: true })
    .resize(OUT_W, OUT_H, { fit: "fill", kernel: "lanczos3" })
    .toBuffer();
  const sharpened = await sharpenUpscaled(raw);
  return sharp(sharpened).webp({ quality: 95, effort: 6 }).toBuffer();
}

async function main() {
  const input = process.argv[2];
  const useWrap = process.argv.includes("--wrap");
  const nameIdx = process.argv.indexOf("--name");
  const slug = nameIdx !== -1 ? process.argv[nameIdx + 1] : "custom-generated-villa";

  if (!input || !fs.existsSync(input)) {
    console.error("Usage: node scripts/apply-custom-hero.mjs <image-path> [--wrap] [--name slug]");
    process.exit(1);
  }

  console.log(`Processing ${input} → ${slug} (${useWrap ? "cylindrical wrap" : "direct fill"})…`);
  const webp = useWrap ? await wrapToEquirectangular(input) : await fillEquirectangular(input);

  fs.mkdirSync(OPTIONS, { recursive: true });
  const optionPath = path.join(OPTIONS, `${slug}.webp`);
  fs.writeFileSync(optionPath, webp);
  fs.writeFileSync(HERO, webp);

  const preview = await sharp(webp).extract({ left: 2048, top: 1024, width: 4096, height: 2048 }).jpeg({ quality: 88 }).toBuffer();
  fs.writeFileSync(optionPath.replace(".webp", "-preview.jpg"), preview);

  const mb = (webp.length / 1024 / 1024).toFixed(1);
  console.log(`Saved public/hero-panorama.webp (${mb} MB)`);
  console.log(`Saved public/hero-options/${slug}.webp`);
  console.log("Hard-refresh http://localhost:5173/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
