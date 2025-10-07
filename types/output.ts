export type FinalOutputViewProps = {
  fileName: string
  fileContent: string
  mimeType?: string | null
  onClose?: () => void
  onContentChange?: (content: string) => void
}

export type GeneratedFileResult = {
  fileName: string
  fileContent: string
  mimeType: string | null
}
