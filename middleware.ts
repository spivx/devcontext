import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { CANONICAL_HOST } from "@/lib/site-metadata";

const LOCALHOST_ALLOWLIST = new Set(["localhost", "127.0.0.1", "[::1]"]);

const isProductionDeployment = (): boolean => {
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv) {
    return vercelEnv === "production";
  }

  return process.env.NODE_ENV === "production";
};

export function middleware(request: NextRequest) {
  if (!isProductionDeployment()) {
    return NextResponse.next();
  }

  const canonicalHost = CANONICAL_HOST.toLowerCase();
  const requestHostname = request.nextUrl.hostname.toLowerCase();

  if (requestHostname === canonicalHost || LOCALHOST_ALLOWLIST.has(requestHostname)) {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.hostname = canonicalHost;
  redirectUrl.protocol = "https";
  redirectUrl.port = "";

  return NextResponse.redirect(redirectUrl, 308);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|site.webmanifest|sitemap.xml|manifest.json|og-image.png).*)",
  ],
};

