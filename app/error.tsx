"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("English Study application error", error); }, [error]);
  return (
    <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24 }}>
      <section role="alert" style={{ maxWidth: 520, textAlign: "center" }}>
        <h2>Something went wrong</h2>
        <p>This section could not load. Your saved account data has not been cleared.</p>
        <button type="button" onClick={reset}>Try again</button>
      </section>
    </main>
  );
}
