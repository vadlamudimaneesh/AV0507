import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/interiors", label: "Interiors" },
  { to: "/facades", label: "Facades" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

type SiteHeaderProps = {
  transparent?: boolean;
};

export function SiteHeader({ transparent }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const showSolid = scrolled || !transparent;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        showSolid ? "bg-background/85 backdrop-blur border-b border-border/60" : "bg-transparent",
      )}
    >
      <div className="container-editorial flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="font-serif text-xl md:text-2xl tracking-tight text-foreground">
          Archz Studiø
        </Link>
        <nav className="hidden lg:flex items-center gap-9 text-[13px] tracking-wide">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "text-foreground/70 hover:text-foreground transition-colors",
                location.pathname === n.to && "text-foreground",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <button className="lg:hidden p-2 -mr-2" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border/60 bg-background">
          <nav className="container-editorial flex flex-col py-4">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="py-3 text-sm text-foreground/80 border-b border-border/40 last:border-0">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
