import { Skeleton } from "@/components/ui/skeleton";

export default function LessonsLoading() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 md:py-12 relative">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Skeleton */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-16 w-64 md:w-96 rounded-2xl" />
              <Skeleton className="h-4 w-48 rounded-lg" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-12 w-32 rounded-xl" />
              <Skeleton className="h-12 w-32 rounded-xl" />
            </div>
          </div>
          <Skeleton className="h-24 w-full rounded-[2rem]" />
        </div>

        {/* Content Skeleton */}
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 space-y-8">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-[2rem]" />
              ))}
            </div>
          </div>
          <aside className="lg:w-80 space-y-8">
             <Skeleton className="h-[30rem] w-full rounded-[2.5rem]" />
             <Skeleton className="h-48 w-full rounded-[2.5rem]" />
          </aside>
        </div>
      </div>
    </main>
  );
}
