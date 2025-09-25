import { clsx, type ClassValue } from "clsx"
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
