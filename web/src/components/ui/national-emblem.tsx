import { cn } from "@/lib/utils"

interface NationalEmblemProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeClasses = {
  sm: "w-8 h-9",
  md: "w-12 h-14",
  lg: "w-16 h-19",
  xl: "w-20 h-23"
}

export function NationalEmblem({ className, size = "md" }: NationalEmblemProps) {
  return (
    <img
      src="/src/assets/images/national-emblem.svg"
      alt="Quốc huy Việt Nam"
      className={cn(sizeClasses[size], className)}
      loading="lazy"
    />
  )
}