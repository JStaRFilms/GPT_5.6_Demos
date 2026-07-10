# Living Prism

An interactive WebGL organism inspired by the supplied iridescent oil-slick reference. The form breathes, drifts and responds to pointer movement while preserving the reference palette: near-black body, coral/orange warmth, magenta/violet seams, and cyan/emerald edges.

## Run locally

```bash
npm install
npm run dev
```

Build the production version with:

```bash
npm run build
```

## Interaction

- **Move** the pointer to tilt and wake the form.
- **Hold** the pointer to intensify deformation.
- Use **Pause motion** to freeze the autonomous animation.
- `prefers-reduced-motion` is respected automatically.

The original image is retained at `public/reference/iridescent-blob-reference.png` for visual reference only; the rendered form is procedural.
