import { clsx, type ClassValue } from "clsx"
import { Activity, Bot, Code, Terminal, Zap, type LucideIcon } from "lucide-react"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getHomeMainClasses(showWizard: boolean) {
  return cn(
    "min-h-screen flex flex-col items-center px-4 pb-24 pt-28 transition-all duration-300",
    showWizard ? "justify-start" : "justify-center text-center"
  )
}

export type HeroIconItem = {
  icon: LucideIcon
  label: string
}

const HERO_ICON_ITEMS: HeroIconItem[] = [
  { icon: Code, label: "VS Code" },
  { icon: Activity, label: "React" },
  { icon: Zap, label: "Angular" },
  { icon: Terminal, label: "Cursor" },
  { icon: Bot, label: "GitHub Copilot" },
]

export function getHeroIconItems() {
  return HERO_ICON_ITEMS
}
