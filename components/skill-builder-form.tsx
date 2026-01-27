"use client"

import { useState, useEffect } from "react"
import { Download, Wand2 } from "lucide-react"
import { skillTemplates, type SkillTemplate } from "@/lib/skill-templates"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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

export function SkillBuilderForm() {
    const [data, setData] = useState<SkillData>({
        name: "",
        description: "",
        dependencies: "",
        content: DEFAULT_CONTENT,
    })

    const [preview, setPreview] = useState("")

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

    const loadTemplate = (template: SkillTemplate) => {
        setData({
            name: template.skillData.name,
            description: template.skillData.description,
            dependencies: template.skillData.dependencies,
            content: template.skillData.content,
        })
    }

    return (
        <div className="space-y-8">
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">Start with a template</h2>
                </div>
                <p className="text-muted-foreground">Select a template to pre-fill the skill configuration.</p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {skillTemplates.map((template) => (
                        <Button
                            key={template.id}
                            variant="outline"
                            className="h-auto w-full flex-col items-start gap-2 p-4 text-left hover:border-primary hover:bg-primary/5 whitespace-normal"
                            onClick={() => loadTemplate(template)}
                        >
                            <span className="font-semibold">{template.name}</span>
                            <span className="text-xs font-normal text-muted-foreground">
                                {template.description}
                            </span>
                        </Button>
                    ))}
                </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Skill Configuration</CardTitle>
                        <CardDescription>
                            Define metadata and instructions for your custom Claude skill.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name (max 64 chars)</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Brand Guidelines"
                                maxLength={64}
                                value={data.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("name", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (max 200 chars)</Label>
                            <Textarea
                                id="description"
                                placeholder="Critical: Defines when Claude should use this skill."
                                maxLength={200}
                                className="resize-none"
                                rows={3}
                                value={data.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange("description", e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground text-right">
                                {data.description.length}/200
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dependencies">Dependencies (Optional)</Label>
                            <Input
                                id="dependencies"
                                placeholder="e.g., python>=3.8, pandas>=1.5.0"
                                value={data.dependencies}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("dependencies", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Markdown Body</Label>
                            <Textarea
                                id="content"
                                placeholder="## Overview..."
                                className="min-h-[300px] font-mono text-sm"
                                value={data.content}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange("content", e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col h-full">
                    <CardHeader>
                        <CardTitle>Preview</CardTitle>
                        <CardDescription>
                            This is how your <code>Skill.md</code> file will look.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="h-full rounded-md border bg-muted/50 p-4 font-mono text-sm whitespace-pre-wrap overflow-auto max-h-[600px]">
                            {preview}
                        </div>
                    </CardContent>
                    <CardFooter className="border-t p-6">
                        <Button onClick={handleDownload} className="w-full sm:w-auto ml-auto">
                            <Download className="mr-2 size-4" />
                            Download Skill.md
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
