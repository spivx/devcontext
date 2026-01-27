import { Github } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

import { Button } from "@/components/ui/button"
import { SkillBuilderForm } from "@/components/skill-builder-form"
import { AnimatedBackground } from "@/components/AnimatedBackground"
import { getAllSkills } from "@/lib/skills"

export const metadata: Metadata = {
    title: "Claude Skills Marketplace - Free AI Agent Skills Library",
    description: "Browse and download high-quality Skill.md files for Claude and other AI agents. Enhance your AI with capabilities for Coding, DevOps, Testing, and more.",
    keywords: ["Claude skills", "skills marketplace", "Skill.md", "AI agent capabilities", "coding skills", "devops skills"],
    alternates: {
        canonical: "/skills",
    },
}

const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Claude Skills Marketplace",
    "description": "A marketplace of custom Skill.md files for Claude AI to enhance its capabilities.",
    "url": "https://devcontext.xyz/skills",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
    }
};

export default function SkillsPage() {
    const skills = getAllSkills();

    return (
        <div className="relative min-h-screen bg-background text-foreground" data-testid="skills-page">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
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

                <main className="container mx-auto max-w-7xl px-4 py-8 lg:px-8 flex-1" data-testid="skills-main-content">
                    <div className="mb-8 space-y-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Beta</span>
                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Skills Marketplace
                            </h1>
                        </div>
                        <p className="max-w-2xl text-muted-foreground text-lg">
                            Download ready-to-use <code>Skill.md</code> files or customize them to give Claude new capabilities.
                            Community-driven skills for Frameworks, DevOps, Testing, and Quality Assurance.
                        </p>
                    </div>

                    <SkillBuilderForm initialSkills={skills} />

                    <section className="mt-16 space-y-8 border-t pt-12">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
                            <div className="grid gap-8 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg text-primary">What&apos;s in the Marketplace?</h3>
                                    <p className="text-muted-foreground">
                                        You&apos;ll find dozens of pre-configured skills covering everything from React Component generation to Docker configurations and Security Audits. All free to use and modify.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg text-primary">How do I contribute?</h3>
                                    <p className="text-muted-foreground">
                                        DevContext is open source! You can contribute new skills by adding a markdown file to the <code>skills/</code> directory in our GitHub repository.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg text-primary">How do I use a Skill.md file?</h3>
                                    <p className="text-muted-foreground">
                                        Download the file and upload it to your Claude project, or reference it in your AI agent configuration (like local LLMs or Cursor).
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg text-primary">Can I use these skills in IDEs?</h3>
                                    <p className="text-muted-foreground">
                                        Yes! Many IDE extensions and AI agents (like Cline, Roo Code, or Cursor) support custom skill definitions. By providing a structured <code>Skill.md</code>, you ensure consistent behavior across different environments.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    )
}
