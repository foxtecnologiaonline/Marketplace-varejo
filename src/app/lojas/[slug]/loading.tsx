import { ProductGridSkeleton, Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="container-page py-8">
      <div className="card mb-8 flex items-center gap-4 p-6">
        <Skeleton className="h-20 w-20 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <ProductGridSkeleton />
    </div>
  );
}
