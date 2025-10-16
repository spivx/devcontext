import type { PackageJson } from "@/types/repo-scan"

export const dependencyHas = (pkg: PackageJson, names: string[]): boolean => {
    const sources = [
        pkg.dependencies,
        pkg.devDependencies,
        pkg.peerDependencies,
        pkg.optionalDependencies,
    ]

    return sources.some((source) =>
        source ? names.some((name) => Object.prototype.hasOwnProperty.call(source, name)) : false,
    )
}
