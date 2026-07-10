"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowIcon, ReloadIcon } from "@/components/showcase/icons";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main-content" className="route-state route-error">
      <div className="state-orbit error-orbit" aria-hidden="true"><i /><i /><i /></div>
      <div>
        <p className="eyebrow">Signal interrupted</p>
        <h1>This observation could not be resolved.</h1>
        <p>Retry the route now. If the signal remains unavailable, return to the collection and choose another specimen.</p>
        <div className="route-state-actions">
          <button className="primary-button" type="button" onClick={reset}><ReloadIcon /> Retry observation</button>
          <Link className="secondary-button" href="/">Return to collection <ArrowIcon /></Link>
        </div>
        {error.digest ? <small>Reference {error.digest}</small> : null}
      </div>
    </main>
  );
}
