import * as simpleIcons from "simple-icons"
import type { SimpleIcon } from "simple-icons"

const iconSlugOverrides: Record<string, string> = {
  vscode: "microsoft",
  visualstudiocode: "microsoft",
  css3: "css",
  materialui: "mui",
  rxjs: "reactivex",
}

export const iconColorOverrides: Record<string, string> = {
  nextdotjs: "#0070F3",
  angular: "#DD0031",
}

const customIconBySlug: Record<string, { svg: string; hex: string }> = {
  "folder-tree": {
    hex: "#6366F1",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h5l2 2h11a1 1 0 0 1 1 1v2" /><path d="M3 6v12a1 1 0 0 0 1 1h7" /><path d="M12 13h6" /><path d="M16 9v8" /></svg>',
  },
  layout: {
    hex: "#F97316",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /><path d="M3 10h6" /></svg>',
  },
  microsoftazure: {
    hex: "#0078D4",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.6 3.2 3.1 20.8a.6.6 0 0 0 .55.84h5.26a.8.8 0 0 0 .68-.39l2.44-4.12h5.28l-2.1 4.94a.6.6 0 0 0 .55.84h4.84a.6.6 0 0 0 .57-.38L21 17.5a.8.8 0 0 0-.74-1.09h-5.33l3.36-7.62a.6.6 0 0 0-.56-.83h-6.23l1.06-2.57a.6.6 0 0 0-.56-.79h-1.01a.8.8 0 0 0-.73.5Z" /></svg>',
  },
  playwright: {
    hex: "#2AC866",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6.84 3.85a2.4 2.4 0 0 1 2.18-.29l12.37 4.09c1.7.56 2.13 2.74.75 3.92l-7.45 6.43a2.4 2.4 0 0 1-2.44.38l-11.01-4.34C.5 13.31.19 11.15 1.7 10l5.14-4.12Zm6 1.62L3.82 6.8a1.2 1.2 0 0 0-.8 1.99l8.82 8.78a1.2 1.2 0 0 0 1.65.02l7.14-6.18a1.2 1.2 0 0 0-.34-2.03l-7.45-2.93Zm1.21 2.72c1.76 0 3.18 1.51 3.18 3.38s-1.42 3.39-3.18 3.39c-1.76 0-3.18-1.52-3.18-3.39s1.42-3.38 3.18-3.38Zm0 1.8c-.8 0-1.44.72-1.44 1.58 0 .87.65 1.59 1.44 1.59.8 0 1.45-.72 1.45-1.59 0-.86-.65-1.58-1.45-1.58Z" /></svg>',
  },
}

const simpleIconBySlug = (() => {
  const map = new Map<string, SimpleIcon>()
  const isSimpleIcon = (icon: unknown): icon is SimpleIcon =>
    typeof icon === "object" && icon !== null && "slug" in icon && "svg" in icon

  Object.values(simpleIcons).forEach((icon) => {
    if (isSimpleIcon(icon)) {
      map.set(icon.slug, icon)
    }
  })

  return map
})()

const simpleIconMarkupCache = new Map<string, string>()

const getSimpleIconMarkup = (icon: SimpleIcon) => {
  if (simpleIconMarkupCache.has(icon.slug)) {
    return simpleIconMarkupCache.get(icon.slug)!
  }

  const markup = icon.svg.replace(
    "<svg ",
    '<svg fill="currentColor" class="fill-current" '
  )

  simpleIconMarkupCache.set(icon.slug, markup)
  return markup
}

const normalizeHex = (hex: string) => {
  const trimmed = hex.trim().replace(/^#/, "")
  if (trimmed.length === 3) {
    return trimmed
      .split("")
      .map((char) => char + char)
      .join("")
  }
  return trimmed.padEnd(6, "0").slice(0, 6)
}

export const getAccessibleIconColor = (hex: string) => {
  const normalized = normalizeHex(hex)
  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)

  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255

  if (Number.isNaN(luminance)) {
    return "#A0AEC0"
  }

  if (luminance < 0.35) {
    const lighten = (component: number) =>
      Math.min(255, Math.round(component + (255 - component) * 0.45))

    const lr = lighten(r)
    const lg = lighten(g)
    const lb = lighten(b)

    return `#${lr.toString(16).padStart(2, "0")}${lg
      .toString(16)
      .padStart(2, "0")}${lb.toString(16).padStart(2, "0")}`
  }

  return `#${normalized}`
}

const normalizeIconSlug = (raw?: string) => {
  if (!raw) {
    return null
  }

  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^cdn\.simpleicons\.org\//, "")
    .replace(/^\/icons\//, "")
    .replace(/\.svg$/, "")

  if (!cleaned) {
    return null
  }

  return iconSlugOverrides[cleaned] ?? cleaned
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

export const hexToRgba = (hex: string, alpha: number) => {
  const normalized = normalizeHex(hex)
  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)

  if ([r, g, b].some((component) => Number.isNaN(component))) {
    return null
  }

  const clampedAlpha = clamp(alpha, 0, 1)

  return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`
}

export type IconDescriptor = {
  slug: string
  markup: string
  hex: string
}

export const getIconDescriptor = (raw?: string): IconDescriptor | null => {
  const normalized = normalizeIconSlug(raw)
  if (!normalized) {
    return null
  }

  const customIcon = customIconBySlug[normalized]
  if (customIcon) {
    return {
      slug: normalized,
      markup: customIcon.svg,
      hex: customIcon.hex,
    }
  }

  const simpleIcon = simpleIconBySlug.get(normalized)
  if (simpleIcon) {
    return {
      slug: simpleIcon.slug,
      markup: getSimpleIconMarkup(simpleIcon),
      hex: simpleIcon.hex,
    }
  }

  return null
}

export const getFallbackInitials = (label: string) =>
  label
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase()
