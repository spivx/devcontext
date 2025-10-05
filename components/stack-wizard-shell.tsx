import Link from "next/link"

import { AnimatedBackground } from "@/components/AnimatedBackground"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"
import { getHomeMainClasses } from "@/lib/utils"
import type { StackWizardShellProps } from "@/types/wizard"

export function StackWizardShell({ children, showWizard = true }: StackWizardShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <AnimatedBackground />
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
