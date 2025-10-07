const GITHUB_HOSTS = new Set(["github.com", "www.github.com"])

export const normalizeGitHubRepoInput = (value: string): string | null => {
    const trimmed = value.trim()

    if (!trimmed) {
        return null
    }

    try {
        if (trimmed.includes("://")) {
            const url = new URL(trimmed)

            if (!GITHUB_HOSTS.has(url.hostname.toLowerCase())) {
                return null
            }

            const segments = url.pathname
                .split("/")
                .map((segment) => segment.trim())
                .filter(Boolean)

            if (segments.length < 2) {
                return null
            }

            return `https://github.com/${segments[0]}/${segments[1]}`
        }

        const pathSegments = trimmed.split("/").filter(Boolean)

        if (pathSegments.length !== 2) {
            return null
        }

        return `https://github.com/${pathSegments.join("/")}`
    } catch (error) {
        console.error("Failed to normalize GitHub repository input", error)
        return null
    }
}

export const decodeRepoRouteParam = (rawValue: string | undefined): string | null => {
    if (!rawValue) {
        return null
    }

    try {
        let current = rawValue

        for (let i = 0; i < 3; i += 1) {
            const next = decodeURIComponent(current)

            if (next === current) {
                break
            }

            current = next
        }

        const candidate = current.trim()

        if (!candidate || candidate.toLowerCase() === "undefined") {
            return null
        }

        return candidate
    } catch (error) {
        console.error("Failed to decode GitHub repo route param", error)
        return null
    }
}
