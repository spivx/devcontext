import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function ExistingProjectPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-24 text-center text-foreground">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Existing projects are coming soon</h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
            We&apos;re crafting guided flows to ingest your current instructions, audit gaps, and align new guidance with your repository. Leave your email in the wizard and we&apos;ll reach out the moment it&apos;s live.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/new">Explore the new project wizard</Link>
        </Button>
      </div>
    </div>
  )
}
