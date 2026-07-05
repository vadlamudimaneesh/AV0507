import { type QueryClient, queryOptions } from "@tanstack/react-query";
import { fetchAllProjectsAdmin, fetchProjectBySlug, fetchProjects } from "./data-store";
import type { ProjectCategory } from "./types";

export const projectsQuery = (category?: ProjectCategory) =>
  queryOptions({
    queryKey: ["projects", category ?? "all"],
    queryFn: () => fetchProjects(category),
  });

export const projectBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["projects", "slug", slug],
    queryFn: () => fetchProjectBySlug(slug),
  });

export const adminProjectsQuery = () =>
  queryOptions({
    queryKey: ["projects", "admin"],
    queryFn: fetchAllProjectsAdmin,
  });

export function prefetchProjects(queryClient: QueryClient) {
  return queryClient.ensureQueryData(projectsQuery());
}
