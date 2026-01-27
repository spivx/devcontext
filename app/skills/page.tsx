import { Github } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

import { Button } from "@/components/ui/button"
import { SkillBuilderForm } from "@/components/skill-builder-form"
import { AnimatedBackground } from "@/components/AnimatedBackground"

export const metadata: Metadata = {
    title: "Claude Skill Builder | DevContext",
    description: "Create custom skills for Claude AI. Generate properly formatted Skill.md files with metadata and instructions.",
}

export default function SkillsPage() {
    return (
        <div className="relative min-h-screen bg-background text-foreground">
            <AnimatedBackground />

            <div className="relative z-10 flex min-h-screen flex-col">
                <header className="flex items-center justify-between px-6 py-6 lg:px-12 lg:py-8 border-b bg-background/50 backdrop-blur-sm">
                    <Link href="/" className="text-sm font-semibold text-foreground transition hover:text-primary">
                        DevContext
                    </Link>
                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                            <Link href="https://support.claude.com/en/articles/12512198-how-to-create-custom-skills" target="_blank" rel="noreferrer">
                                Claude Skills Docs
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <Link href="https://github.com/spivx/devcontext" rel="noreferrer" target="_blank">
                                <Github className="size-4" />
                                GitHub
                            </Link>
                        </Button>
                    </div>
                </header>

                <main className="container mx-auto max-w-7xl px-4 py-8 lg:px-8 flex-1">
                    <div className="mb-8 space-y-4">
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Claude Custom Skill Builder
                        </h1>
                        <p className="max-w-2xl text-muted-foreground text-lg">
                            Create <code>Skill.md</code> files to give Claude new capabilities. Define metadata,
                            dependencies, and instructions in a standardized format.
                        </p>
                    </div>

                    <SkillBuilderForm />
                </main>
            </div>
        </div>
    )
}
