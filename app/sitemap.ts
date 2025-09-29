import type { MetadataRoute } from "next";

const baseUrl = "https://devcontext.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const entries: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
    { path: "", priority: 1, changeFrequency: "weekly" },
    { path: "/new", priority: 0.9, changeFrequency: "weekly" },
    { path: "/existing", priority: 0.6, changeFrequency: "monthly" },
  ]

  return entries.map(({ path, priority, changeFrequency }) => ({
    url: `${baseUrl}${path}`,
    priority,
    changeFrequency,
    lastModified,
  }))
}
