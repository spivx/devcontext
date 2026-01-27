"use client"

import { useState, useEffect } from "react"
import { Download, Search, Check, FileText, X, Settings2, Eye } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { type Skill } from "@/lib/skills"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface SkillData {
    name: string
    description: string
    dependencies: string
    content: string
}

const DEFAULT_CONTENT = `## Steps
1. [Step 1]
2. [Step 2]

## Examples
User: [Input]
Assistant: [Output]
`

interface SkillBuilderFormProps {
    initialSkills: Skill[]
}

type Tab = "editor" | "preview"

export function SkillBuilderForm({ initialSkills }: SkillBuilderFormProps) {
    const [data, setData] = useState<SkillData>({
        name: "",
        description: "",
        dependencies: "",
        content: DEFAULT_CONTENT,
    })

    const [preview, setPreview] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<Tab>("editor")

    const filteredSkills = initialSkills.filter(skill =>
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    useEffect(() => {
        // Generate preview
        let output = `name: ${data.name || "My Skill"}\n`
        output += `description: ${data.description || "Skill description"}\n`

        if (data.dependencies) {
            output += `dependencies: ${data.dependencies}\n`
        }

        output += `\n${data.content}`

        setPreview(output)
    }, [data])

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isDrawerOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }
        return () => {
            document.body.style.overflow = "unset"
        }
    }, [isDrawerOpen])

    const handleChange = (field: keyof SkillData, value: string) => {
        setData((prev) => ({ ...prev, [field]: value }))
    }

    const handleDownload = () => {
        const blob = new Blob([preview], { type: "text/markdown" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        // Use the skill name for filename, replacing spaces with dashes, or default
        const safeName = (data.name || "skill").toLowerCase().replace(/[^a-z0-9]+/g, "-")
        link.download = `${safeName}.md`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    const loadTemplate = (skill: Skill) => {
        setData({
            name: skill.name,
            description: skill.description,
            dependencies: skill.dependencies || "",
            content: skill.content,
        })
        setSelectedSkillId(skill.id)
        setIsDrawerOpen(true)
        setActiveTab("editor")
    }

    const handleCreateNew = () => {
        setData({
            name: "",
            description: "",
            dependencies: "",
            content: DEFAULT_CONTENT,
        })
        setSelectedSkillId(null)
        setIsDrawerOpen(true)
        setActiveTab("editor")
    }

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false)
        setSelectedSkillId(null)
    }

    return (
        <div className="space-y-8">
            <section className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Browse Skills Library</h2>
                        <p className="text-muted-foreground mt-1">Select a skill to customize and download.</p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-[300px]">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search skills..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                data-testid="skill-search-input"
                            />
                        </div>
                        <Button onClick={handleCreateNew} variant="secondary" data-testid="create-custom-skill-button">
                            Create Custom
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredSkills.length > 0 ? (
                        filteredSkills.map((skill) => (
                            <div
                                key={skill.id}
                                className={cn(
                                    "group relative flex flex-col gap-3 rounded-lg border p-4 hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer",
                                    selectedSkillId === skill.id && "border-primary bg-primary/5 ring-1 ring-primary"
                                )}
                                onClick={() => loadTemplate(skill)}
                                data-testid={`skill-card-${skill.id}`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10 text-primary">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <h3 className="font-semibold leading-none">{skill.name}</h3>
                                    </div>
                                    {selectedSkillId === skill.id && <Check className="h-4 w-4 text-primary" />}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {skill.description}
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-muted-foreground">
                            No skills found matching your search.
                        </div>
                    )}
                </div>
            </section>

            <AnimatePresence>
                {isDrawerOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseDrawer}
                            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                            className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-2xl flex-col border-l bg-background shadow-xl sm:max-w-[800px]"
                            data-testid="skill-drawer"
                        >
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between border-b px-6 py-4">
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        {selectedSkillId ? "Edit Skill" : "Create New Skill"}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Customize metadata and content before downloading.
                                    </p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={handleCloseDrawer} data-testid="close-drawer-button">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Tabs / Toolbar */}
                            <div className="border-b px-6 py-2 flex items-center justify-between bg-muted/30">
                                <div className="flex items-center p-1 bg-muted rounded-lg">
                                    <button
                                        onClick={() => setActiveTab("editor")}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                                            activeTab === "editor"
                                                ? "bg-background shadow text-foreground"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                        data-testid="editor-tab-button"
                                    >
                                        <Settings2 className="h-4 w-4" />
                                        Editor
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("preview")}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                                            activeTab === "preview"
                                                ? "bg-background shadow text-foreground"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                        data-testid="preview-tab-button"
                                    >
                                        <Eye className="h-4 w-4" />
                                        Preview
                                    </button>
                                </div>

                                <Button onClick={handleDownload} size="sm" data-testid="download-skill-button">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                </Button>
                            </div>

                            {/* Drawer Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {activeTab === "editor" ? (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Name (max 64 chars)</Label>
                                                <Input
                                                    id="name"
                                                    placeholder="e.g., Brand Guidelines"
                                                    maxLength={64}
                                                    value={data.name}
                                                    onChange={(e) => handleChange("name", e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="dependencies">Dependencies (Optional)</Label>
                                                <Input
                                                    id="dependencies"
                                                    placeholder="e.g., python>=3.8, pandas>=1.5.0"
                                                    value={data.dependencies}
                                                    onChange={(e) => handleChange("dependencies", e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description (max 200 chars)</Label>
                                            <Textarea
                                                id="description"
                                                placeholder="Critical: Defines when Claude should use this skill."
                                                maxLength={200}
                                                className="resize-none"
                                                rows={2}
                                                value={data.description}
                                                onChange={(e) => handleChange("description", e.target.value)}
                                            />
                                            <p className="text-xs text-muted-foreground text-right">
                                                {data.description.length}/200
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="content">Markdown Body</Label>
                                            <Textarea
                                                id="content"
                                                placeholder="## Overview..."
                                                className="min-h-[400px] font-mono text-sm leading-relaxed"
                                                value={data.content}
                                                onChange={(e) => handleChange("content", e.target.value)}
                                                data-testid="skill-content-input"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full rounded-lg border bg-muted/30 p-6 font-mono text-sm whitespace-pre-wrap animate-in fade-in slide-in-from-bottom-2 duration-300" data-testid="skill-preview-content">
                                        {preview}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
