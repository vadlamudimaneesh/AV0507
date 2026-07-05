import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ContactSubmission, Project } from "./types";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!)
  : null;

export type Database = {
  public: {
    Tables: {
      projects: { Row: Project; Insert: Omit<Project, "id" | "created_at" | "updated_at">; Update: Partial<Project> };
      contact_submissions: { Row: ContactSubmission; Insert: Omit<ContactSubmission, "id" | "created_at">; Update: Partial<ContactSubmission> };
    };
  };
};
