"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Github, Code, Terminal, Zap, Bot, Activity } from "lucide-react"
import Link from "next/link"

import { InstructionsWizard } from "@/components/instructions-wizard"
import { ThemeToggle } from "@/components/theme-toggle"
import Logo from "./../components/Logo"

export default function Home() {
  const [showWizard, setShowWizard] = useState(false)

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
      <main
        className={`min-h-screen flex flex-col items-center px-4 pb-24 pt-28 transition-all duration-300 ${
          showWizard ? "justify-start" : "justify-center text-center"
        }`}
      >
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
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border bg-card shadow-sm transition-shadow hover:shadow-md">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">VS Code</p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border bg-card shadow-sm transition-shadow hover:shadow-md">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">React</p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border bg-card shadow-sm transition-shadow hover:shadow-md">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Angular</p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border bg-card shadow-sm transition-shadow hover:shadow-md">
                  <Terminal className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Cursor</p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border bg-card shadow-sm transition-shadow hover:shadow-md">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">GitHub Copilot</p>
              </div>
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
