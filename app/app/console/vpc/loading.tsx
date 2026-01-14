export default function VpcLoading() {
  return (
    <div className="m-2 md:m-6 space-y-2 md:space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-8 w-20 bg-muted animate-pulse rounded" />
      </div>
      <div className="border-2 rounded-xl md:p-6 p-2">
        <div className="space-y-4">
          <div className="h-10 bg-muted animate-pulse rounded" />
          <div className="h-12 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  )
}
