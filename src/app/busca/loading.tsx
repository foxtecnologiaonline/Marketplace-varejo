import { ProductGridSkeleton, Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="container-page py-8">
      <Skeleton className="mb-6 h-8 w-64" />
      <ProductGridSkeleton />
    </div>
  );
}
