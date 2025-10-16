import { describe, expect, it } from "vitest"

import { detectPythonTestingSignals } from "@/lib/repo-scan/python-testing-signals"
import type { PackageJson } from "@/types/repo-scan"

const createPkg = (deps: Partial<PackageJson>): PackageJson => ({ ...deps })

describe("detectPythonTestingSignals", () => {
  it("adds behave when features directory structure is present", async () => {
    const testing = new Set<string>()
    await detectPythonTestingSignals(
      ["features/example.feature", "features/steps/login_steps.py", "features/environment.py"],
      null,
      testing,
    )

    expect(Array.from(testing)).toContain("behave")
  })

  it("adds behave when dependency is detected", async () => {
    const testing = new Set<string>()
    await detectPythonTestingSignals(
      [],
      createPkg({ devDependencies: { behave: "^1.2.3" } }),
      testing,
    )

    expect(Array.from(testing)).toContain("behave")
  })

  it("adds unittest when Python-style test files exist", async () => {
    const testing = new Set<string>()
    await detectPythonTestingSignals(["tests/test_example.py", "src/app.py"], null, testing)

    expect(Array.from(testing)).toContain("unittest")
  })
})
