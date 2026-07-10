# Living Prism — Version Two

A Next.js 15 / React 19 interactive WebGL study of the supplied iridescent blob reference. The site includes a live **Version One / Version Two** switch: Version One preserves the original radial procedural form, while Version Two uses animated metaballs, a custom thin-film GLSL material, and postprocessing for a fuller, more fluid organism.

## Stack

- Next.js 15 + React 19 + TypeScript
- Three.js + React Three Fiber
- `@react-three/drei` marching cubes and adaptive rendering
- `@react-three/postprocessing`
- Custom GLSL vertex and fragment shaders
- Tailwind CSS v4
- Motion

## Run

```bash
npm install
npm run dev
```

Production checks:

```bash
npm run typecheck
npm run build
```

## Interaction

- Choose **Version One** or **Version Two** from the top-right switch.
- Move the pointer to change the field and surface response.
- Hold on the canvas to intensify the fluid pulse.
- Pause/resume autonomous motion from the desktop control.
- `prefers-reduced-motion` is respected automatically.

The supplied visual reference remains at `public/reference/iridescent-blob-reference.png`. The organism itself is rendered procedurally in real time.
