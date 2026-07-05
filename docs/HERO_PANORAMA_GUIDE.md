# Hero 360° Panorama — Custom Villa Guide

Your requirement — **standing at the center of a modern open-plan villa** and rotating to see **living room, kitchen, drawing area, stairs, chandelier, modern cupboards, and dining** — needs a **single equirectangular 360° render** from your own project model.

The site now uses a **custom AI-generated equirectangular 360°** (`assets/hero-panorama-generated.png` → `public/hero-panorama.webp`) built from your reference interiors: open-plan villa with living, kitchen, dining, stairs, ring chandelier, and mezzanine.

Regenerate after updating the PNG:

```bash
npm run apply:hero
```

## Export from Enscape (SketchUp / Revit / Rhino)

1. Place the **360° Panorama** camera at the **center of your open-plan ground floor** (where living, kitchen, and dining meet).
2. Set eye height ~ **1.6 m**.
3. Render panorama at **8192 × 4096** (or 4096 × 2048 minimum).
4. Export as **PNG or JPG** (avoid heavy HDR for web).
5. Convert to WebP (optional):

```bash
npx sharp-cli -i render.png -o public/hero-panorama.webp resize 8192 4096 webp
```

Or place the PNG/JPG in `public/` and update `HERO_PANORAMA_URL` in `src/lib/data-store.ts`.

## Export from V-Ray / Corona / Blender

- **V-Ray:** Camera → Type **Spherical panorama**, FOV 360×180, place at villa center.
- **Blender:** Camera → Panorama type **Equirectangular**, 8192×4096 render.
- **Twinmotion:** Media → **360° Panorama** from center of house.

## Paid stock (exact match to your brief)

If you need a ready-made asset before your own render is ready:

| Source | Description |
|--------|-------------|
| [iStock 930740192](https://www.istockphoto.com/photo/modern-studio-apartment-360-equirectangular-panoramic-interior-gm930740192-255151411) | Modern apartment 360° — living, kitchen, dining, **double-height stairs** |
| [Getty 1321116143](https://www.gettyimages.com/detail/photo/equirectangular-panoramic-interior-of-modern-villa-royalty-free-image/1321116143) | Modern villa 360° — living, kitchen, stairs |

Download equirectangular (2:1 ratio), save as `public/hero-panorama.webp`.

## Apply any panorama

```powershell
copy "public\hero-options\villa-01-glasshouse-open-plan.webp" "public\hero-panorama.webp"
```

Hard-refresh the home page (`Ctrl+Shift+R`).

## Room labels on the hero

Edit yaw angles (radians) in `src/lib/data-store.ts` → `HERO_ZONE_LABELS` after you swap in your render, so labels align with kitchen / dining / living as you rotate.
