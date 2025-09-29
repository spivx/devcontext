import Link from "next/link"

import { AnimatedBackground } from "@/components/AnimatedBackground"
import { Hero } from "@/components/Hero"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <AnimatedBackground />
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-end px-6 py-6 lg:px-12 lg:py-8">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/new">Launch wizard</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="https://github.com/spivx/devcontext" rel="noreferrer" target="_blank">
                <Github className="size-4" />
                GitHub
              </Link>
            </Button>
          </div>
        </header>

        <main className="flex flex-1 flex-col">
          <Hero />
        </main>


      </div>
    </div>
  )
}
