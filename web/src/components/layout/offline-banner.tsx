import { WifiOff } from 'lucide-react'

export function OfflineBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 px-4 py-2">
      <div className="flex items-center justify-center gap-2 text-sm font-medium">
        <WifiOff className="w-4 h-4" />
        <span>Bạn đang offline. Dữ liệu sẽ được đồng bộ khi có kết nối.</span>
      </div>
    </div>
  )
}
