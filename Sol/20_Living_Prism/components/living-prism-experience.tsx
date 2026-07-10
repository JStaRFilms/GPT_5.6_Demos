"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import type { PrismVersion } from "@/components/prism-canvas";

const PrismCanvas = dynamic(() => import("@/components/prism-canvas"), {
  ssr: false,
  loading: () => <div className="prism-fallback absolute inset-0" aria-hidden="true" />,
});

const versionContent = {
  1: {
    eyebrow: "Digital organism / No. 03",
    lineOne: "A spectrum",
    lineTwo: "with a pulse.",
    description: "Light, liquid and restless. Move through its field and it will move with you.",
  },
  2: {
    eyebrow: "Fluid reference study / No. 04",
    lineOne: "Liquid light",
    lineTwo: "made alive.",
    description: "A deeper black-glass organism, grown from moving fields and wrapped in spectral light.",
  },
} as const;

export function LivingPrismExperience() {
  const prefersReducedMotion = useReducedMotion();
  const [version, setVersion] = useState<PrismVersion>(1);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) setPaused(true);
  }, [prefersReducedMotion]);

  useEffect(() => {
    const requestedVersion = new URLSearchParams(window.location.search).get("version");
    if (requestedVersion === "2") setVersion(2);
  }, []);

  useEffect(() => {
    const release = () => setInteracting(false);
    window.addEventListener("pointerup", release);
    window.addEventListener("blur", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("blur", release);
    };
  }, []);

  const chooseVersion = (nextVersion: PrismVersion) => {
    if (nextVersion !== version) {
      setInteracting(false);
      setVersion(nextVersion);
      const url = new URL(window.location.href);
      url.searchParams.set("version", String(nextVersion));
      window.history.replaceState({}, "", url);
    }
  };

  const copy = versionContent[version];

  return (
    <main className="relative isolate h-svh w-full overflow-hidden bg-[#020104] text-[#f7f3f8]">
      <div
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_72%_45%,rgba(73,20,70,0.12),transparent_32%),#020104]"
        aria-hidden="true"
      />
      <PrismCanvas
        version={version}
        paused={paused}
        interacting={interacting}
        onInteractionChange={setInteracting}
      />
      <div
        className="prism-grain pointer-events-none absolute inset-0 z-10 opacity-[0.035] mix-blend-soft-light"
        aria-hidden="true"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={`wash-${version}`}
          className="pointer-events-none absolute inset-0 z-[11] bg-black"
          initial={{ opacity: 0.36 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0.18 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.75, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
        />
      </AnimatePresence>

      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between px-[var(--gutter)] py-[clamp(1.35rem,3vw,2.75rem)]">
        <a
          className="prism-focus pointer-events-auto inline-flex items-center gap-3 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-white no-underline"
          href="#intro"
          aria-label="Living Prism, home"
        >
          <svg className="h-[1.35rem] w-[1.35rem] fill-none stroke-current stroke-[1.05]" viewBox="0 0 26 26" aria-hidden="true">
            <path d="M13 2.5c2.8 0 3 3.4 5.2 4.6 2.3 1.3 5.2-.6 6.2 1.7.9 2.2-2 3.8-2 6.3s2.8 4.3 1.3 6.2c-1.5 1.8-4-.4-6.5.7-2.4 1-2 4.4-4.8 3.9-2.7-.5-2.2-3.7-4.4-5C5.8 19.6 3 21.4 1.8 19c-1.2-2.4 1.8-3.8 1.8-6.4 0-2.5-2.8-4-.9-6.2 1.8-2.1 4.2.2 6.6-.9C11.7 4.5 10.4 2.5 13 2.5Z" />
          </svg>
          <span className="hidden sm:inline">Living Prism</span>
        </a>

        <div className="pointer-events-auto flex flex-col items-end gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div
            className="flex rounded-full border border-white/15 bg-black/35 p-1 shadow-[0_10px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl"
            role="group"
            aria-label="Choose organism version"
          >
            {([1, 2] as const).map((item) => {
              const active = item === version;
              return (
                <button
                  key={item}
                  className={`prism-focus relative min-h-9 rounded-full px-3.5 text-[0.6rem] font-medium uppercase tracking-[0.14em] transition-colors duration-200 sm:px-4 ${
                    active ? "text-white" : "text-white/45 hover:text-white/80"
                  }`}
                  type="button"
                  aria-pressed={active}
                  onClick={() => chooseVersion(item)}
                >
                  {active && (
                    <motion.span
                      layoutId="active-version"
                      className="absolute inset-0 rounded-full border border-white/15 bg-white/10"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative">Version {item === 1 ? "One" : "Two"}</span>
                </button>
              );
            })}
          </div>

          <button
            className="prism-focus hidden min-h-9 border-b border-white/20 bg-transparent px-0 text-[0.6rem] font-medium uppercase tracking-[0.14em] text-white/55 transition-colors duration-200 hover:border-[#ff6e64] hover:text-white sm:block"
            type="button"
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? "Resume motion" : "Pause motion"}
          </button>
        </div>
      </header>

      <section
        id="intro"
        className="pointer-events-none absolute bottom-[clamp(2rem,6.5vh,5.5rem)] left-[var(--gutter)] z-20 max-w-[min(35rem,44vw)] max-[760px]:bottom-8 max-[760px]:max-w-[calc(100vw-2.5rem)]"
        aria-labelledby="page-title"
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={version}
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -12, filter: "blur(6px)" }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.62, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-4 text-[clamp(0.58rem,0.65vw,0.7rem)] font-medium uppercase tracking-[0.24em] text-white/50">
              {copy.eyebrow}
            </p>
            <h1 id="page-title" className="prism-title m-0 whitespace-nowrap text-[#f7f3f8]">
              {copy.lineOne}
              <br />
              <em>{copy.lineTwo}</em>
            </h1>
            <p className="ml-[clamp(0.7rem,4vw,4rem)] mt-[clamp(1.5rem,3.2vh,2.75rem)] max-w-[19rem] text-[clamp(0.72rem,0.86vw,0.9rem)] font-light leading-[1.65] tracking-[0.02em] text-white/50 max-[760px]:ml-3 max-[760px]:mt-6">
              {copy.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </section>

      <div className="pointer-events-none absolute bottom-[clamp(2rem,6vh,4.75rem)] right-[var(--gutter)] z-20 hidden items-center gap-3 text-[0.58rem] font-medium uppercase leading-[1.65] tracking-[0.16em] text-white/40 min-[761px]:flex" aria-hidden="true">
        <svg className="h-11 w-11 overflow-visible fill-none stroke-white/30 stroke-[0.75]" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="19.5" />
          <motion.circle
            cx="25"
            cy="5.5"
            r="2.5"
            className="fill-[#ff715c] stroke-none"
            style={{ transformOrigin: "25px 25px", filter: "drop-shadow(0 0 5px #ff4f78)" }}
            animate={paused || prefersReducedMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 4.8, repeat: Infinity, ease: "linear" }}
          />
        </svg>
        <span>Move to awaken<br />Hold to stir</span>
      </div>

      <div className="sr-only" aria-live="polite">
        Version {version} selected. {paused ? "Motion paused." : "The organism is moving."}
      </div>
    </main>
  );
}
