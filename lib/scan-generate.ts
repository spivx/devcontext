"use client"

import { generateInstructions } from "@/lib/instructions-api"
import { getFileOptions } from "@/lib/wizard-config"
import type { RepoScanSummary } from "@/types/repo-scan"
import type { GeneratedFileResult } from "@/types/output"
import { buildResponsesFromScan } from "@/lib/scan-to-wizard"

const fileOptions = getFileOptions()

export type OutputFileId = "instructions-md" | "agents-md" | "cursor-rules"

export async function generateFromRepoScan(
  scan: RepoScanSummary,
  outputFileId: OutputFileId
): Promise<GeneratedFileResult | null> {
  const { stack, responses } = buildResponsesFromScan(scan)
  responses.outputFile = outputFileId

  const selected = fileOptions.find((f) => f.id === outputFileId) || null

  const result = await generateInstructions({
    stackSegment: stack,
    outputFileId,
    responses,
    fileFormat: selected?.format,
  })

  return result
}

