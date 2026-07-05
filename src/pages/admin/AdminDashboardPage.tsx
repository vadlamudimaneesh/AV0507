import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { SiteShell } from "@/components/SiteShell";
import { deleteProject, fetchAllProjectsAdmin, logoutAdmin } from "@/lib/data-store";
import type { Project } from "@/lib/types";
import { RequireAdmin } from "./AdminLoginPage";

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setProjects(await fetchAllProjectsAdmin());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onDelete(p: Project) {
    if (!confirm(`Delete "${p.title}"?`)) return;
    try {
      await deleteProject(p.id);
      toast.success("Project deleted");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function onSignOut() {
    await logoutAdmin();
    navigate("/admin");
  }

  return (
    <RequireAdmin>
      <SiteShell>
        <Toaster position="top-center" />
        <section className="container-editorial py-16">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="eyebrow">Studio</div>
              <h1 className="mt-3 font-serif text-4xl md:text-5xl">Admin</h1>
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/admin/projects/new" className="border-b border-foreground pb-1 hover:text-accent hover:border-accent">+ New project</Link>
              <button onClick={onSignOut} className="text-muted-foreground hover:text-accent">Sign out</button>
            </div>
          </div>
          <div className="mt-12 border-t border-border/60">
            {loading && <div className="py-8 text-sm text-muted-foreground">Loading…</div>}
            {!loading && projects.length === 0 && <div className="py-8 text-sm text-muted-foreground">No projects yet.</div>}
            <ul className="divide-y divide-border/60">
              {projects.map((p) => (
                <li key={p.id} className="py-5 flex items-center gap-4 flex-wrap">
                  <div className="h-14 w-20 bg-muted overflow-hidden shrink-0">
                    {p.cover_image && <img src={p.cover_image} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-serif text-lg">{p.title}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-widest">
                      {p.category} · {p.location} · {p.year}
                      {!p.published && " · Draft"}
                      {p.featured && " · Featured"}
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <Link to={`/admin/projects/${p.id}`} className="hover:text-accent">Edit</Link>
                    <button onClick={() => onDelete(p)} className="text-destructive hover:opacity-70">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </SiteShell>
    </RequireAdmin>
  );
}
