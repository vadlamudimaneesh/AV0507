import { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HomePage } from "@/pages/HomePage";
import { PortfolioPage, CategoryPage } from "@/pages/PortfolioPage";
import { ProjectDetailPage } from "@/pages/ProjectDetailPage";
import { GalleryPage } from "@/pages/GalleryPage";
import { AboutPage } from "@/pages/AboutPage";
import { ContactPage } from "@/pages/ContactPage";
import { HeroPreviewPage } from "@/pages/HeroPreviewPage";
import { NotFoundPage, PrivacyPage, TermsPage } from "@/pages/StaticPages";
import { AdminLoginPage } from "@/pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminProjectFormPage } from "@/pages/admin/AdminProjectFormPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
  },
});

function PageLoader() {
  return <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground text-sm">Loading…</div>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/portfolio/:slug" element={<ProjectDetailPage />} />
            <Route path="/interiors" element={<CategoryPage category="interiors" />} />
            <Route path="/facades" element={<CategoryPage category="facades" />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/hero-preview" element={<HeroPreviewPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/admin" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/projects/new" element={<AdminProjectFormPage />} />
            <Route path="/admin/projects/:id" element={<AdminProjectFormPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
