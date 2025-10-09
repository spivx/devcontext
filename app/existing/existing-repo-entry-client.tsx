"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { normalizeGitHubRepoInput } from "@/lib/github"

export function ExistingRepoEntryClient() {
  const router = useRouter()
  const [value, setValue] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalized = normalizeGitHubRepoInput(value)

    if (!normalized) {
      setError("Enter a valid public GitHub repository URL (e.g. https://github.com/owner/repo).")
      return
    }

    setError(null)
    setIsSubmitting(true)

    const encoded = encodeURIComponent(normalized)

    router.push(`/existing/${encoded}`)
  }

  return (
    <div
      className="relative flex min-h-screen flex-col bg-background text-foreground"
      data-testid="existing-repo-page"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" aria-hidden="true" />
      <header className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-12 lg:py-8">
        <Link href="/" className="text-sm font-semibold text-foreground transition hover:text-primary">
          DevContext
        </Link>
        <Button variant="ghost" asChild size="sm">
          <Link href="/new">Launch wizard</Link>
        </Button>
      </header>
      <div className="relative z-10 flex flex-1 justify-center px-4 pb-16">
        <Card className="mx-auto mt-4 w-full max-w-2xl gap-0 border-border/50 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl">Analyze an existing repository</CardTitle>
            <CardDescription>
              Enter a public GitHub repository URL to detect stack, tooling, and testing conventions automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-4"
              onSubmit={handleSubmit}
              data-testid="existing-repo-form"
            >
              <div className="flex flex-col gap-2">
                <label htmlFor="githubUrl" className="text-sm font-medium text-foreground">
                  GitHub repository URL
                </label>
                <Input
                  id="githubUrl"
                  name="githubUrl"
                  type="url"
                  placeholder="https://github.com/vercel/next.js"
                  autoComplete="off"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  aria-describedby={error ? "github-url-error" : undefined}
                  aria-invalid={error ? true : undefined}
                  data-testid="existing-repo-input"
                />
                <p className="text-xs text-muted-foreground">
                  You can also paste an <code>owner/repo</code> slug and we will normalize it for you.
                </p>
                {error ? (
                  <p
                    id="github-url-error"
                    className="text-sm text-destructive"
                    data-testid="existing-repo-error"
                  >
                    {error}
                  </p>
                ) : null}
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
                data-testid="existing-repo-submit"
              >
                {isSubmitting ? "Redirecting…" : "Analyze repository"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
