import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { MixpanelInit } from "@/components/MixpanelInit";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://devcontext.com";
const siteTitle = "DevContext – AI Coding Guidelines & Context Generator";
const siteDescription =
  "DevContext helps developers generate AI config files like Copilot instructions, Cursor rules, and prompts — consistent, fast, IDE-ready.";

const ogImage = `${siteUrl}/og-image.png`;

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "DevContext",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: siteUrl,
  image: ogImage,
  description: siteDescription,
  author: {
    "@type": "Organization",
    name: "DevContext",
    url: siteUrl,
  },
  offers: {
    "@type": "Offer",
    price: 0,
    priceCurrency: "USD",
  },
  featureList: [
    "Guided wizard for AI coding instructions",
    "Prebuilt templates for Copilot, Cursor, and IDE agents",
    "Context-aware questions with best-practice examples",
  ],
  keywords: [
    "generate Copilot instructions file",
    "generate agents file",
    "generate AI instructions",
    "generate Cursor rules",
    "AI development workflows",
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | DevContext`,
  },
  applicationName: "DevContext",
  description: siteDescription,
  keywords: [
    "AI coding guidelines",
    "AI prompt templates",
    "Copilot instructions generator",
    "Cursor rules builder",
    "IDE setup automation",
    "Developer onboarding docs",
    "generate Copilot instructions file",
    "generate agents file",
    "generate instructions",
    "generate Cursor rule",
    "Copilot instructions",
    "Cursor rules",
    "agents md",
  ],
  authors: [{ name: "DevContext" }],
  creator: "DevContext",
  publisher: "DevContext",
  category: "Technology",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: siteTitle,
    description:
      "Generate AI config files like Copilot instructions, Cursor rules, and prompts. Consistent, fast, and IDE-ready.",
    url: siteUrl,
    siteName: "DevContext",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "DevContext marketing preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description:
      "Generate AI config files like Copilot instructions, Cursor rules, and prompts. Consistent, fast, and IDE-ready.",
    images: [ogImage],
    site: "@devcontext",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  themeColor: "#09090b",
  other: {
    "msapplication-TileColor": "#09090b",
  },
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script id="structured-data" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(structuredData)}
        </Script>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <MixpanelInit />
          </Suspense>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
