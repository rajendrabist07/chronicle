import Skeleton from "../../components/ui/Skeleton";

export default function PostDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-9 w-20" />
      </div>
      <Skeleton className="h-4 w-40" />
      <div className="space-y-3 pt-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}
