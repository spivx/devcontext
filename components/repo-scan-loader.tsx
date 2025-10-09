import type { HTMLAttributes } from "react"

interface RepoScanLoaderProps extends HTMLAttributes<HTMLDivElement> {
    message?: string
}

export default function RepoScanLoader({ message = "Scanning repository…", className = "", ...rest }: RepoScanLoaderProps) {
    return (
        <div
            role="status"
            aria-live="polite"
            className={`repo-scan-loader ${className}`.trim()}
            data-testid="repo-scan-loader"
            {...rest}
        >
            <div className="repo-scan-loader__orb" aria-hidden="true">
                <span className="repo-scan-loader__pulse" />
                <span className="repo-scan-loader__pulse repo-scan-loader__pulse--delayed" />
                <span className="repo-scan-loader__orbit">
                    <span className="repo-scan-loader__satellite" />
                    <span className="repo-scan-loader__satellite repo-scan-loader__satellite--secondary" />
                </span>
                <span className="repo-scan-loader__core" />
            </div>
            <p className="repo-scan-loader__label">{message}</p>
        </div>
    )
}
