import Link from "next/link";

export default function NotFound() {
  return <main id="main-content" className="not-found"><div className="lost-orbit" aria-hidden="true"><span/><i>404</i></div><div><p className="eyebrow">Signal outside catalogue</p><h1>This coordinate holds no specimen.</h1><p>The record may have moved, remain incomplete, or never have entered the observatory.</p><Link className="primary-button" href="/">Return to collection</Link></div></main>;
}
