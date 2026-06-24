export default function ImportsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Imports</h1>
        <p className="text-sm text-muted-foreground">
          CSV/JSON upload UI will live here. The API endpoint is ready at{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            POST /api/imports
          </code>
          .
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-border p-8 text-sm text-muted-foreground">
        Next step: build a file dropzone that parses rows client-side and posts
        to the import API with Zod validation.
      </div>
    </div>
  );
}
