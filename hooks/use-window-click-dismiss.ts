"use client"

import { useEffect } from "react"

export function useWindowClickDismiss(isActive: boolean, onDismiss: () => void) {
  useEffect(() => {
    if (!isActive) {
      return
    }

    const handleClick = () => {
      onDismiss()
    }

    window.addEventListener("click", handleClick)

    return () => {
      window.removeEventListener("click", handleClick)
    }
  }, [isActive, onDismiss])
}
