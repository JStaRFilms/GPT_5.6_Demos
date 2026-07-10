import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/showcase/site-shell";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

export const viewport: Viewport = { themeColor: "#080a0b" };

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: { default: "Model Observatory — Sol / Terra / Luna", template: "%s — Model Observatory" },
  description: "A curated computational exhibition of runnable model experiments and their making.",
  keywords: ["generative interfaces", "model experiments", "computational design", "Sol", "Terra", "Luna"],
  openGraph: { title: "Model Observatory", description: "Runnable artifacts. Preserved process. Three distinct model practices.", type: "website" },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to content</a><SiteShell>{children}</SiteShell></body></html>;
}
