import catalogueData from "@/generated/catalogue.json";
import type { ModelId, ShowcaseCatalogue, ShowcaseProject } from "@/types/showcase";

export const catalogue = catalogueData as ShowcaseCatalogue;

export function getReadyProjects(): ShowcaseProject[] {
  return catalogue.projects.filter((project) => project.status === "ready");
}

export function getProject(model: string, slug: string): ShowcaseProject | undefined {
  return catalogue.projects.find((project) => project.model === model && project.slug === slug);
}

export function getProjectsByModel(model: ModelId): ShowcaseProject[] {
  return catalogue.projects.filter((project) => project.model === model);
}

export function getComparison(id: string) {
  return catalogue.comparisons.find((comparison) => comparison.id === id);
}
