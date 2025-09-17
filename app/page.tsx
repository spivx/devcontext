"use client"

import { Button } from "@/components/ui/button"
import { Github, Code, Terminal, Zap, Bot, Activity } from "lucide-react"
import Link from "next/link"

import { ThemeToggle } from "@/components/theme-toggle"
import Logo from "./../components/Logo";

export default function Home() {
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
      <main className="min-h-screen flex flex-col items-center justify-center text-center gap-6 px-4">
        <div className="space-y-6">
          {/* Logo/Title */}
          <Logo />

          {/* Headline */}
          <h2 className="text-3xl font-bold max-w-4xl">
            Generate AI Instructions for Your Project in Minutes
          </h2>

          {/* Subheadline */}
          <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
            Choose your IDE and framework, and instantly get a tailored configuration file
            for Copilot, Cursor, or other AI tools.
          </p>

          {/* CTA Button */}
          <div className="pt-4">
            <Button size="lg" className="text-lg px-8 py-6">
              Get Started
            </Button>
          </div>
        </div>

        {/* Icons Row */}
        <div className="flex flex-wrap justify-center gap-8 mt-16 px-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border bg-card shadow-sm hover:shadow-md transition-shadow">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium">VSCode</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border bg-card shadow-sm hover:shadow-md transition-shadow">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium">React</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border bg-card shadow-sm hover:shadow-md transition-shadow">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium">Angular</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border bg-card shadow-sm hover:shadow-md transition-shadow">
              <Terminal className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium">Cursor</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border bg-card shadow-sm hover:shadow-md transition-shadow">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium">Copilot</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <p className="text-sm text-muted-foreground">
          © 2025 devcontext
        </p>
      </footer>
    </div>
  )
}
