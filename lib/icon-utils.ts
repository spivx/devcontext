/**
 * Normalizes a hex color string to a 6-character format
 */
export const normalizeHex = (hex: string): string => {
  const trimmed = hex.trim().replace(/^#/, "")
  if (trimmed.length === 3) {
    return trimmed
      .split("")
      .map((char) => char + char)
      .join("")
  }
  return trimmed.padEnd(6, "0").slice(0, 6)
}

/**
 * Adjusts icon color for better accessibility in dark mode
 */
export const getAccessibleIconColor = (hex: string): string => {
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

const iconSlugOverrides: Record<string, string> = {
  vscode: "microsoft",
  visualstudiocode: "microsoft",
}

/**
 * Normalizes an icon slug for simple-icons lookup
 */
export const normalizeIconSlug = (raw?: string): string | null => {
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