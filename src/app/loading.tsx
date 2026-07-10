export default function Loading() {
  return (
    <main id="main-content" className="route-state route-loading" aria-busy="true" aria-live="polite">
      <div className="state-orbit" aria-hidden="true"><i /><i /><i /></div>
      <div>
        <p className="eyebrow">Observatory transit</p>
        <h1>Aligning the collection</h1>
        <p>Resolving specimens and process records…</p>
        <span className="loading-track" aria-hidden="true"><i /></span>
      </div>
    </main>
  );
}
