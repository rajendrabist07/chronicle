import Skeleton from "../../components/ui/Skeleton";

export default function ReadPostLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 space-y-8">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-12 w-4/5" />

      <div className="flex items-center justify-between border-y border-slate-200 py-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="space-y-4 pt-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/6" />
      </div>
    </div>
  );
}
