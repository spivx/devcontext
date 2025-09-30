import { ANALYTICS_EVENTS } from "@/lib/analytics-events"
import { getMimeTypeForFormat } from "@/lib/wizard-utils"
import { track } from "@/lib/mixpanel"
import type { GeneratedFileResult } from "@/types/output"
import type { WizardResponses } from "@/types/wizard"

type GenerateInstructionsParams = {
  stackSegment: string
  outputFileId: string
  responses: WizardResponses
  fileFormat?: string
}

type GenerateApiResponse = {
  fileName: string
  content: string
}

export const generateInstructions = async ({
  stackSegment,
  outputFileId,
  responses,
  fileFormat,
}: GenerateInstructionsParams): Promise<GeneratedFileResult | null> => {
  track(ANALYTICS_EVENTS.CREATE_INSTRUCTIONS_FILE, {
    outputFile: outputFileId,
  })

  const fetchResponse = await fetch(
    `/api/generate/${encodeURIComponent(stackSegment)}/${encodeURIComponent(outputFileId)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(responses),
    }
  )

  if (!fetchResponse.ok) {
    console.error("Failed to generate file:", await fetchResponse.text())
    return null
  }

  const data = (await fetchResponse.json()) as GenerateApiResponse
  const mimeType = getMimeTypeForFormat(fileFormat) ?? null

  return {
    fileName: data.fileName,
    fileContent: data.content,
    mimeType,
  }
}
