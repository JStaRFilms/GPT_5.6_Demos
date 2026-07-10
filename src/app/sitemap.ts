import type { MetadataRoute } from "next";
import { catalogue } from "@/lib/catalogue";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteUrl();
  const absolute = (path: string) => new URL(path, origin).toString();

  return [
    { url: absolute("/"), changeFrequency: "weekly", priority: 1 },
    ...(["sol", "terra", "luna"] as const).map((model) => ({
      url: absolute(`/models/${model}`),
      changeFrequency: "weekly" as const,
      priority: 0.8
    })),
    ...catalogue.projects.map((project) => ({
      url: absolute(`/experiments/${project.model}/${project.slug}`),
      ...(project.sessionTimestamp ? { lastModified: new Date(project.sessionTimestamp) } : {}),
      changeFrequency: "monthly" as const,
      priority: project.status === "ready" ? 0.7 : 0.4
    })),
    ...catalogue.comparisons.map((comparison) => ({
      url: absolute(`/compare/${comparison.id}`),
      changeFrequency: "monthly" as const,
      priority: 0.75
    }))
  ];
}
