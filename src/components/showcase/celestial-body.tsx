import { useId } from "react";
import type { ModelId } from "@/types/showcase";

interface CelestialBodyProps {
  model: ModelId;
}

function SolBody({ prefix }: { prefix: string }) {
  return <>
    <defs>
      <radialGradient id={`${prefix}-surface`} cx="34%" cy="30%" r="72%">
        <stop offset="0" stopColor="#fff3bf" />
        <stop offset=".28" stopColor="#ffd16f" />
        <stop offset=".68" stopColor="#f59a3d" />
        <stop offset="1" stopColor="#b8491f" />
      </radialGradient>
      <radialGradient id={`${prefix}-flare`}><stop offset=".45" stopColor="#ffc45f" stopOpacity=".42" /><stop offset="1" stopColor="#ff8b36" stopOpacity="0" /></radialGradient>
      <clipPath id={`${prefix}-clip`}><circle cx="80" cy="80" r="42" /></clipPath>
    </defs>
    <circle className="celestial-aura" cx="80" cy="80" r="66" fill={`url(#${prefix}-flare)`} />
    <g className="sun-rays">
      {Array.from({ length: 12 }, (_, index) => <line x1="80" y1="7" x2="80" y2={index % 2 ? "19" : "14"} transform={`rotate(${index * 30} 80 80)`} key={index} />)}
    </g>
    <circle cx="80" cy="80" r="43" fill="#f18d39" opacity=".3" />
    <circle cx="80" cy="80" r="40" fill={`url(#${prefix}-surface)`} />
    <g clipPath={`url(#${prefix}-clip)`} className="sun-surface">
      <path d="M31 65c22-11 27 5 46-2s31-18 54-7M29 91c17-9 30 8 51 1s34-13 53-4M43 111c21-8 37 8 67-5" />
      <circle cx="57" cy="48" r="3" /><circle cx="106" cy="75" r="4" /><circle cx="72" cy="105" r="2.5" />
    </g>
    <circle cx="80" cy="80" r="40" fill="none" stroke="#ffe7a0" strokeOpacity=".58" />
  </>;
}

function TerraBody({ prefix }: { prefix: string }) {
  return <>
    <defs>
      <radialGradient id={`${prefix}-ocean`} cx="31%" cy="25%" r="76%">
        <stop offset="0" stopColor="#9ee8f1" /><stop offset=".32" stopColor="#3e9fbd" /><stop offset=".72" stopColor="#176386" /><stop offset="1" stopColor="#0a2f50" />
      </radialGradient>
      <linearGradient id={`${prefix}-land`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#b8d982" /><stop offset=".55" stopColor="#65a86c" /><stop offset="1" stopColor="#2f7456" /></linearGradient>
      <radialGradient id={`${prefix}-shade`} cx="28%" cy="27%" r="72%"><stop offset=".55" stopColor="#061c31" stopOpacity="0" /><stop offset="1" stopColor="#03101d" stopOpacity=".8" /></radialGradient>
      <clipPath id={`${prefix}-clip`}><circle cx="80" cy="80" r="40" /></clipPath>
    </defs>
    <circle className="earth-atmosphere" cx="80" cy="80" r="46" fill="none" stroke="#70d6e6" strokeOpacity=".12" strokeWidth="7" />
    <circle cx="80" cy="80" r="41" fill="#72d6dd" opacity=".3" />
    <circle cx="80" cy="80" r="40" fill={`url(#${prefix}-ocean)`} />
    <g clipPath={`url(#${prefix}-clip)`} fill={`url(#${prefix}-land)`} className="earth-land">
      <path d="M44 49l8-8 14-2 8 5-2 8-8 3-3 8-8 5-2 12-7-5-4-13 3-5-5-3z" />
      <path d="M59 76l9 5 6 10-3 13-7 12-5-4-1-13-6-8 3-8z" />
      <path d="M87 45l13 2 8 7 11 3 5 10-7 4-7-4-8 4 3 7-7 4-4 14-8 9-5-10 2-12-7-7 2-8 7-3-3-8z" />
      <path d="M109 98l10 1 6 8-6 8-10-4-4-7z" />
    </g>
    <g clipPath={`url(#${prefix}-clip)`} className="earth-clouds">
      <path d="M38 62c15 7 24-5 39-4M80 105c13-8 25 2 38-5M91 56c12-4 21 4 31 1" />
    </g>
    <circle cx="80" cy="80" r="40" fill={`url(#${prefix}-shade)`} />
    <circle cx="80" cy="80" r="40" fill="none" stroke="#b8f0ec" strokeOpacity=".65" />
  </>;
}

function LunaBody({ prefix }: { prefix: string }) {
  return <>
    <defs>
      <radialGradient id={`${prefix}-stone`} cx="31%" cy="27%" r="74%"><stop offset="0" stopColor="#eef1ea" /><stop offset=".4" stopColor="#b9c2c4" /><stop offset=".78" stopColor="#737f8b" /><stop offset="1" stopColor="#354252" /></radialGradient>
      <linearGradient id={`${prefix}-shadow`} x1="0" x2="1"><stop offset=".42" stopColor="#172431" stopOpacity="0" /><stop offset="1" stopColor="#111a28" stopOpacity=".72" /></linearGradient>
      <clipPath id={`${prefix}-clip`}><circle cx="80" cy="80" r="40" /></clipPath>
    </defs>
    <circle cx="80" cy="80" r="43" fill="#a9bad1" opacity=".12" />
    <circle cx="80" cy="80" r="40" fill={`url(#${prefix}-stone)`} />
    <g clipPath={`url(#${prefix}-clip)`} className="moon-maria">
      <path d="M41 65c8-15 19-17 26-9s3 19-9 23-21-2-17-14zM82 89c9-15 27-12 31 1s-7 25-20 22-18-12-11-23z" />
    </g>
    <g className="moon-craters">
      <circle cx="59" cy="48" r="7" /><circle cx="100" cy="62" r="5" /><circle cx="67" cy="94" r="9" /><circle cx="103" cy="101" r="3.5" /><circle cx="45" cy="86" r="3" />
    </g>
    <circle cx="80" cy="80" r="40" fill={`url(#${prefix}-shadow)`} />
    <circle cx="80" cy="80" r="40" fill="none" stroke="#e6edf3" strokeOpacity=".55" />
  </>;
}

export function CelestialBody({ model }: CelestialBodyProps) {
  const prefix = useId().replaceAll(":", "");
  return <svg className={`celestial-body celestial-${model}`} viewBox="0 0 160 160" aria-hidden="true" focusable="false">
    {model === "sol" ? <SolBody prefix={prefix} /> : model === "terra" ? <TerraBody prefix={prefix} /> : <LunaBody prefix={prefix} />}
  </svg>;
}
