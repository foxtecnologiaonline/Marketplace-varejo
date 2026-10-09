import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="container-page py-8">
      <Skeleton className="mb-6 h-4 w-64" />
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="aspect-square w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}
