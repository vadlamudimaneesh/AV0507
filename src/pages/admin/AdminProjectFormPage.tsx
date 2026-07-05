import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { SiteShell } from "@/components/SiteShell";
import { fetchAllProjectsAdmin, saveProject, uploadImage } from "@/lib/data-store";
import type { ProjectCategory } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { RequireAdmin } from "./AdminLoginPage";

const emptyForm = {
  title: "",
  slug: "",
  category: "interiors" as ProjectCategory,
  location: "",
  year: new Date().getFullYear(),
  short_description: "",
  long_description: "",
  cover_image: "",
  gallery: [] as string[],
  featured: false,
  published: true,
  sort_order: 0,
};

export function AdminProjectFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchAllProjectsAdmin().then((projects) => {
      const p = projects.find((x) => x.id === id);
      if (!p) {
        toast.error("Project not found");
        navigate("/admin/dashboard");
        return;
      }
      setForm({
        title: p.title,
        slug: p.slug,
        category: p.category,
        location: p.location ?? "",
        year: p.year ?? new Date().getFullYear(),
        short_description: p.short_description ?? "",
        long_description: p.long_description ?? "",
        cover_image: p.cover_image ?? "",
        gallery: p.gallery ?? [],
        featured: p.featured,
        published: p.published,
        sort_order: p.sort_order,
      });
      setLoading(false);
    });
  }, [id, navigate]);

  async function handleFiles(files: FileList | null, target: "cover" | "gallery") {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        urls.push(await uploadImage(file));
      }
      if (target === "cover") setForm((f) => ({ ...f, cover_image: urls[0] }));
      else setForm((f) => ({ ...f, gallery: [...f.gallery, ...urls] }));
      toast.success("Images uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeGalleryImage(index: number) {
    setForm((f) => ({ ...f, gallery: f.gallery.filter((_, i) => i !== index) }));
  }

  function moveGalleryImage(index: number, direction: -1 | 1) {
    setForm((f) => {
      const next = [...f.gallery];
      const target = index + direction;
      if (target < 0 || target >= next.length) return f;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...f, gallery: next };
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveProject(
        {
          ...form,
          slug: form.slug || slugify(form.title),
          location: form.location || null,
          short_description: form.short_description || null,
          long_description: form.long_description || null,
          cover_image: form.cover_image || null,
        },
        id,
      );
      toast.success(isEdit ? "Project updated" : "Project created");
      navigate("/admin/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <RequireAdmin>
        <SiteShell><div className="container-editorial py-24 text-muted-foreground">Loading…</div></SiteShell>
      </RequireAdmin>
    );
  }

  return (
    <RequireAdmin>
      <SiteShell>
        <Toaster position="top-center" />
        <section className="container-editorial py-16 max-w-2xl">
          <Link to="/admin/dashboard" className="text-sm text-muted-foreground hover:text-accent">← Dashboard</Link>
          <h1 className="mt-6 font-serif text-4xl">{isEdit ? "Edit project" : "New project"}</h1>
          <form onSubmit={onSubmit} className="mt-10 space-y-6">
            <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v, slug: form.slug || slugify(v) })} required />
            <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ProjectCategory })} className="mt-2 w-full border-b border-border/60 bg-transparent py-3 outline-none">
                <option value="interiors">Interiors</option>
                <option value="facades">Facades</option>
              </select>
            </div>
            <Field label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
            <Field label="Year" type="number" value={String(form.year)} onChange={(v) => setForm({ ...form, year: Number(v) })} />
            <Field label="Short description" value={form.short_description} onChange={(v) => setForm({ ...form, short_description: v })} />
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Long description</label>
              <textarea rows={5} value={form.long_description} onChange={(e) => setForm({ ...form, long_description: e.target.value })} className="mt-2 w-full border border-border/60 p-3 outline-none resize-none" />
            </div>

            <div className="flex gap-8">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
                Published
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                Featured on home
              </label>
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Cover image</label>
              {form.cover_image && <img src={form.cover_image} alt="" className="mt-3 h-40 object-cover" />}
              <input type="file" accept="image/*" disabled={uploading} onChange={(e) => handleFiles(e.target.files, "cover")} className="mt-3 block text-sm" />
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Gallery images</label>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {form.gallery.map((src, i) => (
                  <div key={src} className="relative group">
                    <img src={src} alt="" className="aspect-square object-cover w-full" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                      <button type="button" onClick={() => moveGalleryImage(i, -1)} className="text-white text-xs">←</button>
                      <button type="button" onClick={() => removeGalleryImage(i)} className="text-white text-xs">✕</button>
                      <button type="button" onClick={() => moveGalleryImage(i, 1)} className="text-white text-xs">→</button>
                    </div>
                  </div>
                ))}
              </div>
              <input type="file" accept="image/*" multiple disabled={uploading} onChange={(e) => handleFiles(e.target.files, "gallery")} className="mt-3 block text-sm" />
            </div>

            <button type="submit" disabled={saving} className="border border-foreground px-8 py-3 text-sm hover:bg-foreground hover:text-background transition-colors">
              {saving ? "Saving…" : "Save project"}
            </button>
          </form>
        </section>
      </SiteShell>
    </RequireAdmin>
  );
}

function Field({ label, value, onChange, required, type = "text" }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <input required={required} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full border-b border-border/60 bg-transparent py-3 outline-none focus:border-accent" />
    </div>
  );
}
