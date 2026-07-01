"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/error-state";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ErrorState
          title="Application error"
          message={error.message || "The application encountered a fatal error."}
          onRetry={reset}
        />
      </body>
    </html>
  );
}
