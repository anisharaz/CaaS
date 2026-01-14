import { Loader2 } from "lucide-react"

export default function ContainersLoading() {
  return (
    <div
      style={{ height: "calc(100vh - 65px)" }}
      className="lg:overflow-auto md:p-6 p-2 space-y-4"
    >
      <div className="flex justify-between items-center">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <div className="h-10 w-40 bg-muted animate-pulse rounded" />
      </div>
      <div className="border-2 rounded-xl md:p-6 p-2">
        <div className="space-y-4">
          <div className="h-10 bg-muted animate-pulse rounded" />
          <div className="h-16 bg-muted animate-pulse rounded" />
          <div className="h-16 bg-muted animate-pulse rounded" />
          <div className="h-16 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  )
}
