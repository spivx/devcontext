"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { InstructionsWizard } from "@/components/instructions-wizard"
import { ThemeToggle } from "@/components/theme-toggle"
import { getHeroIconItems, getHomeMainClasses } from "@/lib/utils"
import { Github } from "lucide-react"
import Link from "next/link"

import Logo from "./../components/Logo"

export default function Home() {
  const [showWizard, setShowWizard] = useState(false)
  const heroIcons = getHeroIconItems()

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top utility bar */}
      <div className="absolute top-4 left-4 z-10">
        <ThemeToggle />
      </div>
      <div className="absolute top-4 right-4 z-10">
        <Link href="https://github.com/spivx/devcontext" target="_blank">
          <Button variant="outline" size="sm">
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <main className={getHomeMainClasses(showWizard)}>
        {showWizard ? (
          <InstructionsWizard onClose={() => setShowWizard(false)} />
        ) : (
          <>
            <div className="space-y-6">
              {/* Logo/Title */}
              <Logo />

              {/* Headline */}
              <h2 className="max-w-4xl text-3xl font-bold">
                AI Coding Instructions, Backed by Real Developer Experience
              </h2>

              {/* Subheadline */}
              <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                Turn developer best practices into ready-to-use AI instructions.
              </p>

              {/* CTA Button */}
              <div className="pt-4">
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg"
                  onClick={() => setShowWizard(true)}
                >
                  Create My Instructions File
                </Button>
              </div>
            </div>

            {/* Icons Row */}
            <div className="mt-16 flex flex-wrap justify-center gap-8 px-6">
              {heroIcons.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border bg-card shadow-sm transition-shadow hover:shadow-md">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">{label}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <p className="text-sm text-muted-foreground">
          © 2025 DevContext — Instructions powered by developer experience
        </p>
      </footer>
    </div>
  )
}
