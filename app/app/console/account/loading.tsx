export default function AccountLoading() {
  return (
    <div className="md:m-6 m-2 md:space-y-4 space-y-2">
      <div className="md:space-y-4 space-y-2">
        <div className="flex justify-between">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="h-10 w-20 bg-muted animate-pulse rounded" />
        </div>
        <div className="md:p-6 p-3 rounded-xl border-2 space-y-4">
          <div className="md:grid md:space-x-10 grid-cols-2 flex flex-col md:gap-4 gap-2">
            <div className="space-y-2">
              <div className="h-5 w-24 bg-muted animate-pulse rounded" />
              <div className="h-5 w-48 bg-muted animate-pulse rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-5 w-28 bg-muted animate-pulse rounded" />
              <div className="h-5 w-36 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
        <div className="md:p-6 p-3 rounded-xl border-2 space-y-4">
          <div className="h-6 w-24 bg-muted animate-pulse rounded" />
          <div className="space-y-2">
            <div className="h-10 bg-muted animate-pulse rounded" />
            <div className="h-12 bg-muted animate-pulse rounded" />
            <div className="h-12 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}
