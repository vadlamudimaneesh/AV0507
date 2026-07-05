import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 mt-auto">
      <div className="container-editorial py-16 grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="font-serif text-2xl">Møller & Ryde</div>
          <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
            Architecture of quiet intention — interiors and façades from Copenhagen, Paris and Rotterdam.
          </p>
        </div>
        <div className="md:col-span-2 md:col-start-6">
          <div className="eyebrow">Navigate</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/portfolio" className="hover:text-accent">Portfolio</Link></li>
            <li><Link to="/gallery" className="hover:text-accent">Gallery</Link></li>
            <li><Link to="/about" className="hover:text-accent">About</Link></li>
            <li><Link to="/contact" className="hover:text-accent">Contact</Link></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <div className="eyebrow">Studio</div>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Copenhagen</li>
            <li>Paris</li>
            <li>Rotterdam</li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <div className="eyebrow">Connect</div>
          <div className="mt-4 flex gap-4 text-sm">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-accent">Instagram</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-accent">LinkedIn</a>
          </div>
        </div>
      </div>
      <div className="container-editorial pb-8 flex flex-wrap justify-between gap-4 text-xs text-muted-foreground border-t border-border/40 pt-6">
        <span>© {new Date().getFullYear()} Møller & Ryde. All rights reserved.</span>
        <div className="flex gap-6">
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
          <Link to="/admin" className="hover:text-foreground">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
