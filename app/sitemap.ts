import type { MetadataRoute } from "next"

import stacksData from "@/data/stacks.json"
import type { DataQuestionSource } from "@/types/wizard"
import { absoluteUrl } from "@/lib/site-metadata"

const STATIC_ENTRIES: Array<{
  path: string
  priority: number
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
}> = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/new", priority: 0.9, changeFrequency: "weekly" },
  { path: "/existing", priority: 0.6, changeFrequency: "monthly" },
  { path: "/stacks", priority: 0.7, changeFrequency: "monthly" },
  { path: "/new/stack", priority: 0.8, changeFrequency: "weekly" },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  const stackQuestion = (stacksData as DataQuestionSource[])[0]
  const stackSlugs = (stackQuestion?.answers ?? [])
    .map((answer) => (typeof answer.value === "string" ? answer.value.trim() : ""))
    .filter((value): value is string => value.length > 0)

  const stackEntries = stackSlugs.flatMap((slug) => [
    {
      path: `/stacks/${slug}`,
      priority: 0.65,
      changeFrequency: "monthly" as const,
    },
    {
      path: `/new/stack/${slug}`,
      priority: 0.75,
      changeFrequency: "weekly" as const,
    },
    {
      path: `/new/stack/${slug}/summary`,
      priority: 0.6,
      changeFrequency: "weekly" as const,
    },
    {
      path: `/new/stack/${slug}/user/summary`,
      priority: 0.5,
      changeFrequency: "weekly" as const,
    },
  ])

  return [...STATIC_ENTRIES, ...stackEntries].map(({ path, priority, changeFrequency }) => ({
    url: absoluteUrl(path),
    priority,
    changeFrequency,
    lastModified,
  }))
}
