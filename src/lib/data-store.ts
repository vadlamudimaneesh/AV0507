import { supabase, isSupabaseConfigured } from "./supabase";
import type { ContactSubmission, Project, ProjectCategory } from "./types";
import { SEED_PROJECTS } from "./types";
import { slugify } from "./utils";

const STORAGE_KEY = "moller-ryde-projects";
const CONTACT_KEY = "moller-ryde-contacts";
const ADMIN_KEY = "moller-ryde-admin";

function readLocalProjects(): Project[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PROJECTS));
    return SEED_PROJECTS;
  }
  return JSON.parse(raw) as Project[];
}

function writeLocalProjects(projects: Project[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function readLocalContacts(): ContactSubmission[] {
  const raw = localStorage.getItem(CONTACT_KEY);
  return raw ? (JSON.parse(raw) as ContactSubmission[]) : [];
}

function writeLocalContacts(contacts: ContactSubmission[]) {
  localStorage.setItem(CONTACT_KEY, JSON.stringify(contacts));
}

export function isAdminSession(): boolean {
  return localStorage.getItem(ADMIN_KEY) === "true";
}

export function setAdminSession(active: boolean) {
  if (active) localStorage.setItem(ADMIN_KEY, "true");
  else localStorage.removeItem(ADMIN_KEY);
}

export async function loginAdmin(email: string, password: string): Promise<{ error?: string }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  }
  if (email === "admin@studio.com" && password === "admin123") {
    setAdminSession(true);
    return {};
  }
  return { error: "Invalid credentials. Demo: admin@studio.com / admin123" };
}

export async function logoutAdmin() {
  if (isSupabaseConfigured && supabase) await supabase.auth.signOut();
  setAdminSession(false);
}

export async function fetchProjects(category?: ProjectCategory): Promise<Project[]> {
  if (isSupabaseConfigured && supabase) {
    let q = supabase.from("projects").select("*").eq("published", true).order("sort_order", { ascending: true });
    if (category) q = q.eq("category", category);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []) as Project[];
  }
  const all = readLocalProjects().filter((p) => p.published);
  return category ? all.filter((p) => p.category === category) : all;
}

export async function fetchAllProjectsAdmin(): Promise<Project[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("projects").select("*").order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as Project[];
  }
  return readLocalProjects();
}

export async function fetchProjectBySlug(slug: string): Promise<Project | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("projects").select("*").eq("slug", slug).eq("published", true).maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Project | null) ?? null;
  }
  return readLocalProjects().find((p) => p.slug === slug && p.published) ?? null;
}

export async function saveProject(input: Partial<Project> & { title: string; category: ProjectCategory }, id?: string): Promise<Project> {
  const slug = input.slug || slugify(input.title);
  const now = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    const payload = {
      title: input.title,
      slug,
      category: input.category,
      location: input.location ?? null,
      year: input.year ?? null,
      short_description: input.short_description ?? null,
      long_description: input.long_description ?? null,
      cover_image: input.cover_image ?? null,
      gallery: input.gallery ?? [],
      featured: input.featured ?? false,
      published: input.published ?? true,
      sort_order: input.sort_order ?? 0,
    };
    if (id) {
      const { data, error } = await supabase.from("projects").update(payload).eq("id", id).select().single();
      if (error) throw new Error(error.message);
      return data as Project;
    }
    const { data, error } = await supabase.from("projects").insert(payload).select().single();
    if (error) throw new Error(error.message);
    return data as Project;
  }

  const projects = readLocalProjects();
  if (id) {
    const idx = projects.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Project not found");
    projects[idx] = { ...projects[idx], ...input, slug, updated_at: now } as Project;
    writeLocalProjects(projects);
    return projects[idx];
  }
  const created: Project = {
    id: crypto.randomUUID(),
    title: input.title,
    slug,
    category: input.category,
    location: input.location ?? null,
    year: input.year ?? null,
    short_description: input.short_description ?? null,
    long_description: input.long_description ?? null,
    cover_image: input.cover_image ?? null,
    gallery: input.gallery ?? [],
    featured: input.featured ?? false,
    published: input.published ?? true,
    sort_order: input.sort_order ?? projects.length + 1,
    created_at: now,
    updated_at: now,
  };
  projects.unshift(created);
  writeLocalProjects(projects);
  return created;
}

export async function deleteProject(id: string) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  writeLocalProjects(readLocalProjects().filter((p) => p.id !== id));
}

export async function submitContact(form: { name: string; email: string; phone?: string; message: string }) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("contact_submissions").insert({
      name: form.name,
      email: form.email,
      phone: form.phone ?? null,
      message: form.message,
    });
    if (error) throw new Error(error.message);
    return;
  }
  const contacts = readLocalContacts();
  contacts.unshift({
    id: crypto.randomUUID(),
    name: form.name,
    email: form.email,
    phone: form.phone ?? null,
    message: form.message,
    created_at: new Date().toISOString(),
  });
  writeLocalContacts(contacts);
}

export async function uploadImage(file: File): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    const path = `projects/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("project-images").upload(path, file);
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from("project-images").getPublicUrl(path);
    return data.publicUrl;
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export const HERO_PANORAMA_URL = "/hero-panorama.webp";

/** Room zone labels — calibrated for the Indian metro city open-plan panorama */
export const HERO_ZONE_LABELS = [
  { id: "dining",    label: "Dining Area",    yaw: -2.30, pitch: -0.05 },
  { id: "kitchen",   label: "Kitchen",        yaw: -1.50, pitch:  0.00 },
  { id: "living",    label: "Living Room",    yaw: -0.40, pitch: -0.05 },
  { id: "windows",   label: "City View",      yaw:  0.30, pitch:  0.10 },
  { id: "lounge",    label: "Lounge Corner",  yaw:  1.20, pitch:  0.00 },
  { id: "terrace",   label: "Terrace",        yaw:  2.20, pitch:  0.00 },
] as const;

/** Portfolio hotspots (optional — link to projects) */
export const HERO_HOTSPOTS = [
  { id: "portfolio", label: "View portfolio", yaw: -2.4, pitch: 0.12, slug: "willow-house" },
] as const;
