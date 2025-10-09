"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import type { ChangeEvent, MouseEvent } from "react"
import { Copy, Download, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { FinalOutputViewProps } from "@/types/output"

const COPY_RESET_DELAY = 2200

export default function FinalOutputView({ fileName, fileContent, mimeType, onClose, onContentChange }: FinalOutputViewProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle")
  const resetTimerRef = useRef<number | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const [baselineContent, setBaselineContent] = useState(fileContent ?? "")
  const [currentContent, setCurrentContent] = useState(fileContent ?? "")
  const [isMounted, setIsMounted] = useState(false)

  const normalizedFileName = useMemo(() => {
    const trimmed = fileName?.trim()
    return trimmed && trimmed.length > 0 ? trimmed : "instructions.txt"
  }, [fileName])

  useEffect(() => {
    const normalizedContent = fileContent ?? ""
    setBaselineContent(normalizedContent)
    setCurrentContent(normalizedContent)
  }, [fileContent])

  useEffect(() => {
    setCopyStatus("idle")
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current)
      resetTimerRef.current = null
    }
  }, [baselineContent, normalizedFileName])

  useEffect(() => {
    setIsMounted(true)

    return () => {
      setIsMounted(false)
    }
  }, [])

  useEffect(() => {
    if (!isMounted) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    dialogRef.current?.focus()

    return () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current)
      }

      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose, isMounted])

  const handleCopyClick = useCallback(async () => {
    if (!currentContent) {
      return
    }

    try {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        throw new Error("Clipboard API not available")
      }

      await navigator.clipboard.writeText(currentContent)
      setCopyStatus("copied")
    } catch {
      setCopyStatus("error")
    }

    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current)
    }

    resetTimerRef.current = window.setTimeout(() => {
      setCopyStatus("idle")
      resetTimerRef.current = null
    }, COPY_RESET_DELAY)
  }, [currentContent])

  const handleDownloadClick = useCallback(() => {
    if (!currentContent) {
      return
    }

    const downloadMimeType = mimeType ?? "text/plain;charset=utf-8"
    const blob = new Blob([currentContent], { type: downloadMimeType })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = normalizedFileName
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }, [currentContent, mimeType, normalizedFileName])

  const handleBackdropClick = () => {
    onClose?.()
  }

  const handleDialogClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
  }

  const handleRestoreDefault = useCallback(() => {
    setCurrentContent(baselineContent)
    setCopyStatus("idle")
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current)
      resetTimerRef.current = null
    }
    onContentChange?.(baselineContent)
  }, [baselineContent, onContentChange])

  const handleTextareaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current)
      resetTimerRef.current = null
    }
    setCopyStatus("idle")
    const value = event.target.value
    setCurrentContent(value)
    onContentChange?.(value)
  }

  const displayedContent = currentContent && currentContent.length > 0 ? currentContent : ""
  const restoreDisabled = displayedContent === baselineContent

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-labelledby="final-output-title"
      aria-describedby="final-output-description"
      onClick={handleBackdropClick}
      data-testid="final-output-dialog"
    >
      <div
        ref={dialogRef}
        className="relative flex h-full max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-2xl"
        tabIndex={-1}
        onClick={handleDialogClick}
      >
        <header className="flex flex-col gap-4 border-b border-border/60 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" id="final-output-description">
              Instructions ready
            </p>
            <h2 className="text-lg font-semibold text-foreground" id="final-output-title">
              {normalizedFileName}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestoreDefault}
              disabled={restoreDisabled}
            >
              Restore original
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyClick} disabled={!displayedContent}>
              <Copy className="mr-2 h-4 w-4" aria-hidden />
              {copyStatus === "copied"
                ? "Copied"
                : copyStatus === "error"
                  ? "Copy Failed"
                  : "Copy"}
            </Button>
            <Button size="sm" onClick={handleDownloadClick} disabled={!displayedContent}>
              <Download className="mr-2 h-4 w-4" aria-hidden />
              Download
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="ml-2"
            >
              <X className="h-4 w-4" aria-hidden />
              <span className="sr-only">Close preview</span>
            </Button>
          </div>
        </header>
        <div className="relative flex-1 min-h-0 bg-muted/20 p-6">
          <div className="flex h-full flex-1 rounded-2xl border border-border/60 bg-background/95 shadow-inner">
            <textarea
              value={displayedContent}
              onChange={handleTextareaChange}
              spellCheck={false}
              className="min-h-0 h-full w-full resize-none rounded-2xl bg-transparent p-6 font-mono text-sm leading-relaxed text-foreground focus:outline-none"
              aria-label="Generated instructions content"
              placeholder="No content available."
              data-testid="final-output-textarea"
            />
          </div>
        </div>
        <span className="sr-only" aria-live="polite">
          {copyStatus === "copied"
            ? "File content copied to clipboard"
            : copyStatus === "error"
              ? "Unable to copy file content"
              : ""}
        </span>
      </div>
    </div>
  )

  if (!isMounted || typeof document === "undefined") {
    return null
  }

  return createPortal(modalContent, document.body)
}
