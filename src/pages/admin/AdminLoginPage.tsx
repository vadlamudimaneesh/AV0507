import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { SiteShell } from "@/components/SiteShell";
import { isAdminSession, loginAdmin } from "@/lib/data-store";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@studio.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAdminSession()) return <Navigate to="/admin/dashboard" replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await loginAdmin(email, password);
    setLoading(false);
    if (error) return toast.error(error);
    toast.success("Welcome back.");
    navigate("/admin/dashboard");
  }

  return (
    <SiteShell>
      <Toaster position="top-center" />
      <section className="container-editorial py-24 max-w-md">
        <div className="eyebrow">Studio</div>
        <h1 className="mt-4 font-serif text-4xl">Admin login</h1>
        <p className="mt-4 text-sm text-muted-foreground">Demo credentials: admin@studio.com / admin123</p>
        <form onSubmit={onSubmit} className="mt-10 space-y-6">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full border-b border-border/60 bg-transparent py-3 outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full border-b border-border/60 bg-transparent py-3 outline-none focus:border-accent" />
          </div>
          <button type="submit" disabled={loading} className="border border-foreground px-8 py-3 text-sm hover:bg-foreground hover:text-background transition-colors">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <Link to="/" className="mt-8 inline-block text-sm text-muted-foreground hover:text-accent">← Back to site</Link>
      </section>
    </SiteShell>
  );
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  if (!isAdminSession()) return <Navigate to="/admin" replace />;
  return children;
}

export function AdminLayout() {
  return <RequireAdmin>{null}</RequireAdmin>;
}

export { RequireAdmin };
