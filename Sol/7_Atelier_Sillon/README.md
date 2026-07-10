# Atelier Sillon

An interactive digital vinyl store built with React, Tailwind CSS, and Framer Motion. Record sleeves reveal draggable vinyl discs that can be dropped onto a working turntable player.

## Local development

```bash
npm install
npm run dev
```

## Model Observatory preview

Create the path-safe static artifact consumed by the parent showcase:

```bash
npm run build:showcase
```

This writes the committed `out/` directory referenced by `showcase.json`. The build inlines the compiled JavaScript and CSS into a self-contained `index.html`. This is required because the Observatory intentionally previews demos in an opaque-origin iframe without `allow-same-origin`; external Vite module scripts cannot initialize reliably there. Rebuild `out/` whenever the application changes.
