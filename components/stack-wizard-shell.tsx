import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"
import { getHomeMainClasses } from "@/lib/utils"
import type { StackWizardShellProps } from "@/types/wizard"

export function StackWizardShell({ children, showWizard = true }: StackWizardShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,var(--chart-1)/0.35,transparent_55%),radial-gradient(circle_at_80%_20%,var(--chart-2)/0.3,transparent_60%),radial-gradient(circle_at_50%_80%,var(--chart-3)/0.3,transparent_65%)]"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/75 to-background" aria-hidden="true" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="absolute inset-x-0 top-4 flex items-center justify-between px-6 sm:px-8 lg:px-12">
          <Link href="/" className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
            DevContext
          </Link>
          <Link href="https://github.com/spivx/devcontext" target="_blank">
            <Button variant="outline" size="sm">
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </Link>
        </div>

        <main className={getHomeMainClasses(showWizard)}>{children}</main>
      </div>
    </div>
  )
}
