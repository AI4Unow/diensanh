import { cn } from "@/lib/utils"

interface NationalEmblemProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-20 h-20"
}

export function NationalEmblem({ className, size = "md" }: NationalEmblemProps) {
  return (
    <img
      src="/quoc-huy.webp"
      alt="Quốc huy Việt Nam"
      className={cn(sizeClasses[size], "object-contain", className)}
      loading="lazy"
    />
  )
}