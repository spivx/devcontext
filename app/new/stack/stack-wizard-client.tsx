"use client"

import { useRouter } from "next/navigation"

import { InstructionsWizard } from "@/components/instructions-wizard"

const buildStackPath = (stackId?: string | null, view?: "summary" | "default" | "user") => {
  if (!stackId) {
    return "/new/stack"
  }

  if (view === "summary") {
    return `/new/stack/${stackId}/summary`
  }

  if (view === "default") {
    return `/new/stack/${stackId}/default/summary`
  }

  if (view === "user") {
    return `/new/stack/${stackId}/user/summary`
  }

  return `/new/stack/${stackId}`
}

type StackWizardClientProps = {
  stackIdFromRoute: string | null
}

export function StackWizardClient({ stackIdFromRoute }: StackWizardClientProps) {
  const router = useRouter()
  const initialStackId = stackIdFromRoute

  const handleStackSelected = (stackId: string) => {
    router.push(buildStackPath(stackId))
  }

  const handleStackCleared = () => {
    router.push(buildStackPath())
  }

  const handleWizardComplete = (stackId: string | null) => {
    if (!stackId) {
      return
    }

    router.push(buildStackPath(stackId, "user"))
  }

  return (
    <InstructionsWizard
      initialStackId={initialStackId}
      onStackSelected={handleStackSelected}
      onStackCleared={handleStackCleared}
      onComplete={handleWizardComplete}
    />
  )
}
