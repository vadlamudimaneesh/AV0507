# Møller & Ryde — Architecture Firm Website

Premium marketing site for an architecture studio (Interiors + Façades) with admin CMS, gallery, portfolio, and a cinematic scroll-scrub 360° hero.

## Lovable project (Phase 1 scaffold)

A Lovable project was also created during setup:

- **Editor:** https://lovable.dev/projects/e9068ed4-eb60-47b2-8fce-cadd3d7fdf9c
- **Preview:** https://id-preview--e9068ed4-eb60-47b2-8fce-cadd3d7fdf9c.lovable.app

Note: further Lovable iterations require workspace credits. This local repo is the complete implementation.

## Quick start

```bash
npm install
npm run download:panorama   # 8K equirectangular WebP for true 360° hero
npm run dev
```

Open http://localhost:5173

## Admin (demo mode)

Without Supabase configured, the app uses localStorage:

- **URL:** `/admin`
- **Login:** `admin@studio.com` / `admin123`

Upload images, create/edit/delete projects, toggle **Published** and **Featured**.

## Production (Supabase)

1. Create a Supabase project
2. Run `supabase/migrations/001_architecture_cms.sql`
3. Copy `.env.example` → `.env` and add your keys
4. Create an admin user in Supabase Auth and insert into `user_roles`:

```sql
INSERT INTO user_roles (user_id, role) VALUES ('YOUR_USER_UUID', 'admin');
```

## Deploy

### Local production build (full feature set)

```bash
npm run build
npm run preview   # http://localhost:4173
```

Deploy the `dist/` folder to Vercel, Netlify, or any static host. Hero frames in `public/hero-frames/` are copied automatically (60 WebP files, ~10 MB total).

### Lovable cloud (Phase 1 scaffold)

The Lovable project was deployed during setup:

- **Live:** https://sublime-studio-gallery.lovable.app
- **Editor:** https://lovable.dev/projects/e9068ed4-eb60-47b2-8fce-cadd3d7fdf9c

This Lovable deployment includes corporate pages + admin CMS but **not** the scroll-scrub hero (Lovable workspace ran out of credits before Phase 2). Use this local repo for the complete site, or add Lovable credits and send the Phase 2 hero prompt from the plan.

## Features

| Feature | Route |
|---------|-------|
| Scroll-scrub 360 hero + hotspots | `/` |
| Portfolio with filters | `/portfolio` |
| Project detail + lightbox | `/portfolio/:slug` |
| Gallery + category filter + lightbox | `/gallery` |
| About, Contact, Privacy, Terms | `/about`, `/contact`, etc. |
| Admin CMS | `/admin` |

## Replace the 360 panorama

The hero uses a **true equirectangular 360° image** (2:1 ratio) rendered inside a WebGL sphere — scroll rotates a full 360°, drag lets you look around freely.

To use your own interior render:

1. Export an **equirectangular** panorama from V-Ray, Enscape, Blender, etc. (8192×4096 recommended)
2. Replace `public/hero-panorama.webp` or run `npm run download:panorama` after editing the script source
3. Adjust hotspot angles in `src/lib/data-store.ts` (`yaw` / `pitch` in radians)
