import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
      <section>
        <h1>Page not found</h1>
        <p>The page you requested does not exist.</p>
        <Link href="/">Return to English Study</Link>
      </section>
    </main>
  );
}
