import { Link } from "react-router-dom";
import { SiteShell } from "@/components/SiteShell";

export function NotFoundPage() {
  return (
    <SiteShell>
      <div className="container-editorial py-32 text-center">
        <div className="eyebrow">404</div>
        <h1 className="mt-4 font-serif text-5xl">Page not found</h1>
        <p className="mt-6 text-muted-foreground">The page you're looking for doesn't exist or has moved.</p>
        <Link to="/" className="mt-10 inline-block border-b border-foreground pb-1 hover:text-accent">Return home</Link>
      </div>
    </SiteShell>
  );
}

export function PrivacyPage() {
  return (
    <SiteShell>
      <article className="container-editorial py-16 md:py-24 max-w-3xl prose prose-neutral">
        <div className="eyebrow">Legal</div>
        <h1 className="font-serif text-4xl mt-4">Privacy Policy</h1>
        <p className="mt-6 text-foreground/75 leading-relaxed">Archz Studiø respects your privacy. Contact form submissions are stored securely and used only to respond to your inquiry. We do not sell personal data to third parties.</p>
      </article>
    </SiteShell>
  );
}

export function TermsPage() {
  return (
    <SiteShell>
      <article className="container-editorial py-16 md:py-24 max-w-3xl">
        <div className="eyebrow">Legal</div>
        <h1 className="font-serif text-4xl mt-4">Terms of Use</h1>
        <p className="mt-6 text-foreground/75 leading-relaxed">All images and content on this website are copyright Archz Studiø unless otherwise noted. Unauthorised reproduction is prohibited.</p>
      </article>
    </SiteShell>
  );
}
