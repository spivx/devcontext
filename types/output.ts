export type FinalOutputViewProps = {
  fileName: string
  fileContent: string
  mimeType?: string | null
  onClose?: () => void
}

export type GeneratedFileResult = {
  fileName: string
  fileContent: string
  mimeType: string | null
}
