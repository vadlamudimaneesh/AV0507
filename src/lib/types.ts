export type ProjectCategory = "interiors" | "facades";

export type Project = {
  id: string;
  title: string;
  slug: string;
  category: ProjectCategory;
  location: string | null;
  year: number | null;
  short_description: string | null;
  long_description: string | null;
  cover_image: string | null;
  gallery: string[];
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
};

export const SEED_PROJECTS: Project[] = [
  {
    id: "1",
    title: "Willow House",
    slug: "willow-house",
    category: "interiors",
    location: "Copenhagen",
    year: 2024,
    short_description: "A calm family home shaped by oak, linen and northern light.",
    long_description:
      "Willow House is a complete interior renovation of a 1920s villa. We stripped back decades of interventions to reveal the original proportions, then layered in warm oak joinery, hand-trowelled lime plaster and bespoke lighting.",
    cover_image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=85",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=85",
    ],
    featured: true,
    published: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Atelier Marais",
    slug: "atelier-marais",
    category: "interiors",
    location: "Paris",
    year: 2023,
    short_description: "An artist's loft with raw plaster walls and curated daylight.",
    long_description:
      "Atelier Marais transforms a former printworks into a live-work space for a painter. The palette is deliberately restrained — stone, plaster, steel — so the owner's work remains the focal point.",
    cover_image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=85",
    ],
    featured: true,
    published: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Kestrel Tower",
    slug: "kestrel-tower",
    category: "facades",
    location: "Rotterdam",
    year: 2024,
    short_description: "A limestone rainscreen façade with deep-set bronze windows.",
    long_description:
      "Kestrel Tower's façade reinterprets the warehouse district's brick rhythm in contemporary limestone. Deep reveals create shadow and scale, while bronze-framed windows catch the harbour light.",
    cover_image: "https://images.unsplash.com/photo-1486718448742-1633cd30e41c?w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=1200&q=85",
    ],
    featured: true,
    published: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Sea-house",
    slug: "sea-house",
    category: "facades",
    location: "Skagen",
    year: 2022,
    short_description: "Weathered timber cladding for a coastal retreat.",
    long_description:
      "Sea-house sits low against the dunes. Its cedar cladding will silver with salt air; the rhythm of boards echoes the horizon line.",
    cover_image: "https://images.unsplash.com/photo-1518780668897-47a031f0662b?w=1600&q=85",
    gallery: [],
    featured: false,
    published: true,
    sort_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
