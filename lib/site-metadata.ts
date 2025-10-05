const DEFAULT_SITE_URL = "https://www.devcontext.xyz";

const normalizeSiteUrl = (input: string): string => {
  const trimmed = input.trim();
  if (!trimmed) {
    return DEFAULT_SITE_URL;
  }

  const withoutTrailingSlash = trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
  return withoutTrailingSlash || DEFAULT_SITE_URL;
};

export const SITE_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? DEFAULT_SITE_URL,
);

export const absoluteUrl = (path = ""): string => {
  if (!path || path === "/") {
    return SITE_URL;
  }

  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};
