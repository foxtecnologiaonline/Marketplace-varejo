import { ProductGridSkeleton } from "@/components/skeleton";
import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="container-page py-8">
      <Skeleton className="mb-6 h-8 w-48" />
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <Skeleton className="h-96 w-full" />
        <ProductGridSkeleton count={9} />
      </div>
    </div>
  );
}
