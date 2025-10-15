import { NextRequest, NextResponse } from "next/server"

import { buildResponsesFromScan } from "@/lib/scan-to-wizard"
import { renderTemplate } from "@/lib/template-render"
import { getMimeTypeForFormat } from "@/lib/wizard-utils"
import type { RepoScanSummary } from "@/types/repo-scan"

type RouteContext = {
  params: Promise<{ fileId: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { fileId } = await context.params
    const payload = (await request.json()) as { scan?: RepoScanSummary | null; format?: string | null }

    if (!payload?.scan) {
      return NextResponse.json({ error: "Missing scan payload" }, { status: 400 })
    }

    const { stack, responses } = await buildResponsesFromScan(payload.scan)
    responses.outputFile = fileId

    const rendered = await renderTemplate({
      responses,
      frameworkFromPath: stack,
      fileNameFromPath: fileId,
    })

    return NextResponse.json({
      fileName: rendered.fileName,
      content: rendered.content,
      mimeType: getMimeTypeForFormat(payload.format ?? undefined) ?? null,
    })
  } catch (error) {
    console.error("Failed to generate instructions from scan", error)
    return NextResponse.json({ error: "Failed to generate instructions from scan" }, { status: 500 })
  }
}

