export default function Loading() {
  return (
    <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24 }} aria-live="polite" aria-busy="true">
      <section style={{ textAlign: "center" }}>
        <strong>English Study Co.Master</strong>
        <p>Loading your learning space…</p>
      </section>
    </main>
  );
}
