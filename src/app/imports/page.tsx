import { ImportUploadForm } from "@/components/imports/import-upload-form";

export default function ImportsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Imports</h1>
        <p className="text-sm text-muted-foreground">
          Upload Shopee or Lazada CSV/JSON exports. Rows are validated, matched
          to local PC part aliases, and stored as MYR price history.
        </p>
      </div>

      <ImportUploadForm />
    </div>
  );
}
