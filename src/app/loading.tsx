export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="space-y-3">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded-md bg-muted" />
        <div className="mt-8 h-72 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}
