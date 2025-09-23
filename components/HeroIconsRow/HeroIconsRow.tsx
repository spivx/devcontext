import { HeroIconItem } from "@/lib/utils"

type HeroIconsRowProps = {
  items: HeroIconItem[]
}

export default function HeroIconsRow({ items }: HeroIconsRowProps) {
  return (
    <div className="mt-16 flex flex-wrap justify-center gap-8 px-6">
      {items.map(({ icon: Icon, label }) => (
        <div key={label} className="flex flex-col items-center gap-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border bg-card shadow-sm transition-shadow hover:shadow-md">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-medium">{label}</p>
        </div>
      ))}
    </div>
  )
}
