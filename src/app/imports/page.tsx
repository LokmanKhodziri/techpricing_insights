import { ImportUploadForm } from "@/components/imports/import-upload-form";

export default function ImportsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Imports</h1>
        <p className="text-sm text-muted-foreground">
          Upload marketplace CSV or JSON exports. Rows are validated with Zod,
          matched to product aliases, and stored as append-only listings.
        </p>
      </div>

      <ImportUploadForm />
    </div>
  );
}
