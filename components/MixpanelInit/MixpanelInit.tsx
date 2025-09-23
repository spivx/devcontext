"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

import { initMixpanel, trackPageView } from "@/lib/mixpanel"

export function MixpanelInit() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    initMixpanel()
  }, [])

  useEffect(() => {
    if (!pathname) {
      return
    }

    const search = searchParams?.toString()
    trackPageView(pathname, search ? `?${search}` : undefined)
  }, [pathname, searchParams])

  return null
}
