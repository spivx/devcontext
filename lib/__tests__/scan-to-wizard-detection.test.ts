import { describe, expect, it } from "vitest"

import { buildResponsesFromScan } from "@/lib/scan-to-wizard"
import type { RepoScanSummary } from "@/types/repo-scan"

const createBaseScan = (overrides: Partial<RepoScanSummary>): RepoScanSummary => ({
  repo: "owner/repo",
  defaultBranch: "main",
  language: null,
  languages: [],
  frameworks: [],
  tooling: [],
  testing: [],
  structure: { src: false, components: false, tests: false, apps: false, packages: false },
  topics: [],
  warnings: [],
  ...overrides,
})

describe("buildResponsesFromScan detection", () => {
  it("prefers conventions-defined unit testing matches for Python stacks", async () => {
    const scan = createBaseScan({
      languages: ["Python"],
      testing: ["Behave"],
    })

    const result = await buildResponsesFromScan(scan)

    expect(result.stack).toBe("python")
    expect(result.responses.testingUT).toBe("behave")
  })

  it("detects React unit testing tools declared in conventions", async () => {
    const scan = createBaseScan({
      frameworks: ["React"],
      testing: ["jest"],
    })

    const result = await buildResponsesFromScan(scan)

    expect(result.stack).toBe("react")
    expect(result.responses.testingUT).toBe("jest")
  })

  it("detects Angular end-to-end testing tools from conventions", async () => {
    const scan = createBaseScan({
      frameworks: ["Angular"],
      testing: ["Playwright"],
    })

    const result = await buildResponsesFromScan(scan)

    expect(result.stack).toBe("angular")
    expect(result.responses.testingE2E).toBe("playwright")
  })
})
