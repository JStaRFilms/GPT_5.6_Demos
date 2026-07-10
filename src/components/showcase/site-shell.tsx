import Link from "next/link";
import type { ReactNode } from "react";
import { models } from "@/lib/models";

export function Header() {
  return (
    <header className="site-header">
      <Link className="identity" href="/" aria-label="Model Observatory home">
        <span className="identity-mark" aria-hidden="true"><i /><i /><i /></span>
        <span><b>MODEL</b><em>OBSERVATORY</em></span>
      </Link>
      <nav className="primary-nav" aria-label="Primary navigation">
        <div className="model-nav">
          {Object.values(models).map((model) => (
            <Link key={model.id} href={`/models/${model.id}`} style={{ "--model": model.accent } as React.CSSProperties}>
              <span aria-hidden="true" />{model.label}
            </Link>
          ))}
        </div>
        <Link className="compare-link" href="/compare">Compare <span aria-hidden="true">↗</span></Link>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <p className="eyebrow">About the collection</p>
        <p className="footer-note">An evolving record of how three models interpret the same creative frontier—preserved as runnable artifacts and process traces.</p>
        <Link className="built-with-sol-badge" href="/built-with-sol" target="_top">
          <span aria-hidden="true" /> Built with Sol <i>·</i> View build record
        </Link>
      </div>
      <div className="footer-coordinates">
        <span>STATIC ARCHIVE</span><span>MMXXVI—07</span><span>SOL / TERRA / LUNA</span>
      </div>
    </footer>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  return <div className="site-frame"><Header />{children}</div>;
}
