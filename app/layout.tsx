import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevContext – AI Coding Guidelines & Context Generator",
  description:
    "DevContext helps developers generate AI config files like Copilot instructions, Cursor rules, and prompts — consistent, fast, IDE-ready.",

  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    title: "DevContext – AI Coding Guidelines & Context Generator",
    description:
      "Generate AI config files like Copilot instructions, Cursor rules, and prompts. Consistent, fast, and IDE-ready.",
    url: "https://devcontext.com",
    siteName: "DevContext",
    images: [
      {
        url: "/og-image.png", // put a 1200x630 PNG in /public
        width: 1200,
        height: 630,
        alt: "DevContext Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter card
  twitter: {
    card: "summary_large_image",
    title: "DevContext – AI Coding Guidelines & Context Generator",
    description:
      "Generate AI config files like Copilot instructions, Cursor rules, and prompts. Consistent, fast, and IDE-ready.",
    images: ["/og-image.png"], // reuse the same OG image
    creator: "@yourtwitterhandle", // optional
  },

  // Favicon and theme color (optional but good for branding)
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  themeColor: "#ffffff",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
