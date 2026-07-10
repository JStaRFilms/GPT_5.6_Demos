import { catalogue } from "@/lib/catalogue";

export default function HomePage() {
  return (
    <main>
      <h1>Model Showcase</h1>
      <p>{catalogue.counts.ready} experiments are ready to explore.</p>
    </main>
  );
}
