"use client"

import { getFileOptions } from "@/lib/wizard-config"
import { getMimeTypeForFormat } from "@/lib/wizard-utils"
import type { RepoScanSummary } from "@/types/repo-scan"
import type { GeneratedFileResult } from "@/types/output"

const fileOptions = getFileOptions()

export type OutputFileId = "instructions-md" | "agents-md" | "cursor-rules"

export async function generateFromRepoScan(
  scan: RepoScanSummary,
  outputFileId: OutputFileId
): Promise<GeneratedFileResult | null> {
  const selected = fileOptions.find((f) => f.id === outputFileId) || null

  const res = await fetch(`/api/scan-generate/${encodeURIComponent(outputFileId)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ scan, format: selected?.format ?? null }),
  })

  if (!res.ok) {
    console.error("Failed to generate instructions from scan", await res.text())
    return null
  }

  const payload = (await res.json()) as { fileName: string; content: string; mimeType?: string | null }

  return {
    fileName: payload.fileName,
    fileContent: payload.content,
    mimeType: getMimeTypeForFormat(selected?.format) ?? null,
  }
}
