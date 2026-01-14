export default function ContainerDetailLoading() {
  return (
    <div
      style={{
        height: "calc(100vh - 65px)",
        overflow: "auto"
      }}
      className="p-4 space-y-6"
    >
      <div className="space-y-4">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-muted animate-pulse rounded" />
          <div className="h-10 w-24 bg-muted animate-pulse rounded" />
          <div className="h-10 w-24 bg-muted animate-pulse rounded" />
        </div>
      </div>
      <div className="border-2 rounded-xl p-4 space-y-4">
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-5 w-24 bg-muted animate-pulse rounded" />
            <div className="h-5 w-48 bg-muted animate-pulse rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-5 w-24 bg-muted animate-pulse rounded" />
            <div className="h-5 w-36 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
      <div className="border-2 rounded-xl p-4 space-y-4">
        <div className="h-6 w-40 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-12 bg-muted animate-pulse rounded" />
      </div>
    </div>
  )
}
