export type StackDependencySignal = {
    /**
     * String to match when evaluating the dependency file.
     * For substring matches this will be compared case-insensitively.
     */
    match: string
    /**
     * Determines how the match should be evaluated.
     * - substring: perform a case-insensitive substring search.
     * - json-dependency: interpret the file as a package manifest and
     *   look for dependency keys that match the provided name.
     */
    type?: "substring" | "json-dependency"
    /**
     * Framework names to add to the detected frameworks list when the match succeeds.
     */
    addFrameworks?: string[]
    /**
     * Language names to add to the detected languages list when the match succeeds.
     */
    addLanguages?: string[]
    /**
     * Optional stack identifier to prefer when this signal matches.
     */
    preferStack?: string
    /**
     * Optional language to mark as the primary language when this signal matches.
     */
    setPrimaryLanguage?: string
}

export type StackDependencyFileDetection = {
    /**
     * Glob-like patterns (using * and ** wildcards) that identify dependency
     * manifest files relevant for this stack.
     */
    patterns?: string[]
    /**
     * Explicit paths that should be evaluated (useful for root-level files).
     */
    paths?: string[]
    /**
     * Signals that should be evaluated against the file contents.
     */
    signals: StackDependencySignal[]
}

export type StackDetectionConfig = {
    dependencyFiles?: StackDependencyFileDetection[]
}
