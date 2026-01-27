const DEFAULT_SITE_URL = "https://www.devcontext.xyz";

const normalizeSiteUrl = (input: string): string => {
  const trimmed = input.trim();
  if (!trimmed) {
    return DEFAULT_SITE_URL;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    return url.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
};

export const SITE_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? DEFAULT_SITE_URL,
);

export const CANONICAL_HOST = new URL(SITE_URL).hostname;

export const absoluteUrl = (path = ""): string => {
  const base = SITE_URL.endsWith("/") ? SITE_URL.slice(0, -1) : SITE_URL;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // Ensure the root path always has a trailing slash for SEO consistency
  if (normalizedPath === "/") {
    return `${base}/`;
  }

  return `${base}${normalizedPath}`;
};
