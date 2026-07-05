# Archz Studiø — Architecture Firm Website

Premium marketing site for an architecture studio (Interiors + Façades) with admin CMS, gallery, portfolio, and a cinematic scroll-scrub 360° hero.

## Lovable project (Phase 1 scaffold)

A Lovable project was also created during setup:

- **Editor:** https://lovable.dev/projects/e9068ed4-eb60-47b2-8fce-cadd3d7fdf9c
- **Preview:** https://id-preview--e9068ed4-eb60-47b2-8fce-cadd3d7fdf9c.lovable.app

Note: further Lovable iterations require workspace credits. This local repo is the complete implementation.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173. The 360° hero uses `public/hero-panorama.webp` (already included).

## Data & admin

The app runs in one of two modes automatically, based on whether Supabase env vars are present:

- **Supabase configured (recommended / production):** a shared PostgreSQL database, admin auth, and an image-upload storage bucket. Projects and uploaded images are visible to **all** visitors.
- **No Supabase (demo/local only):** falls back to `localStorage`. Data and images live **only in your own browser** and are not visible to visitors — fine for local previewing, not for a published site.

Admin CMS lives at `/admin`:

- Demo login (localStorage mode): `admin@studio.com` / `admin123`
- Supabase mode: the email/password of the admin user you create below.

From the dashboard you can upload cover + gallery images, create/edit/delete projects, and toggle **Published** / **Featured**.

## Set up the database (Supabase — free tier)

GitHub Pages is static hosting only, so the "small database" is a free Supabase project.

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run [`supabase/migrations/001_architecture_cms.sql`](supabase/migrations/001_architecture_cms.sql). This creates the `projects`, `contact_submissions`, and `user_roles` tables, the Row-Level-Security policies, and the public `project-images` storage bucket.
3. Create an admin user under **Authentication → Users → Add user** (email + password), then grant it the admin role in the SQL editor:

```sql
INSERT INTO user_roles (user_id, role) VALUES ('YOUR_USER_UUID', 'admin');
```

4. From **Settings → API**, copy the **Project URL** and the **anon (publishable) key**. The anon key is safe to expose in a static build — RLS protects the data.
5. Copy `.env.example` → `.env` and fill in:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Deploy to GitHub Pages

Deployment is automated via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) (builds on every push to `main`).

1. Push this repo to GitHub.
2. In the repo, go to **Settings → Secrets and variables → Actions → Secrets** and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Go to **Settings → Pages** and set **Source: GitHub Actions** (one-time).
4. Push to `main` — the workflow builds and publishes automatically.

### Base path (project page vs. root)

- **User/org page** (`username.github.io`) or a **custom domain**: nothing to do — the default base is `/`.
- **Project page** (`username.github.io/REPO-NAME/`): add a repository **variable** `VITE_BASE=/REPO-NAME/` (Settings → Secrets and variables → Actions → Variables) **and** change `pathSegmentsToKeep` from `0` to `1` in [`public/404.html`](public/404.html) so deep-link refreshes resolve correctly.

### Local production build

```bash
npm run build
npm run preview   # http://localhost:4173
```

The `dist/` folder is a static bundle deployable to any static host.

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
2. Replace `public/hero-panorama.webp` with your file (keep the same name)
3. Adjust hotspot angles in `src/lib/data-store.ts` (`yaw` / `pitch` in radians)
