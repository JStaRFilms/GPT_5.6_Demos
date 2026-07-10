# Voxel Sandbox Engine

## Status

**Implemented — initialization and local-file Pointer Lock launch behavior hardened.**

## Goal

Deliver a high-performance, desktop-first voxel sandbox in one portable `voxel-sandbox/index.html` file. It will load Three.js from a CDN and run without a build tool or server-side component.

## Player experience

- Procedural hills, water, beaches, trees, and underground stone generated from deterministic 2D/3D noise.
- First-person pointer-lock controls: correctly oriented WASD movement, mouse look, Space jump, and Shift slow/crawl mode with optional fly toggle in the pause menu.
- Break blocks with left click (pixel-particle burst) and place the selected block with right click.
- Six-slot hotbar for Grass, Dirt, Stone, Glass, TNT, and Torch; keyboard keys `1`–`6` and mouse selection both work.
- Physics includes gravity, AABB voxel collision, grounded jumping, and water-aware movement.
- Escape opens a translucent pause menu with Back to Game, Controls, and Reset World options. Back to Game immediately dismisses the overlay, then requests Pointer Lock without making launch depend on that request succeeding.

## Architecture

### Client

- `index.html` contains the markup, styles, procedural texture generator, terrain/noise system, meshing, physics, controls, HUD, menu, and animation loop.
- Three.js is imported from a pinned CDN module URL; no npm dependencies are needed.
- The world emits only externally visible voxel faces into compact material-specific mesh buffers and rebuilds after block changes, keeping rendering and interactions responsive for the 48 × 48 sandbox.

### Server

None. The game is static and runs entirely in the browser.

### Data flow

1. A numeric seed creates deterministic terrain and decorations.
2. Chunks translate voxel IDs to visible mesh geometry and material groups.
3. A raycaster identifies the targeted voxel face for break/place actions.
4. Block changes update the chunk and adjacent chunk boundaries as needed.
5. The render loop advances player physics, wave vertices, particles, HUD targeting, and shadows.

### World data

| Item | Design |
| --- | --- |
| Block storage | `Map` of chunk coordinates to typed voxel arrays |
| World footprint | 48 × 48 × 32 blocks |
| Block IDs | Air, Grass, Dirt, Stone, Sand, Water, Glass, TNT, Torch, Wood, Leaves |
| Generation | Fractal value noise for height; 3D noise for terrain variation and foliage placement |
| Rendering | Hidden-face culling, compact material-specific mesh buffers, separate transparent water/glass meshes |
| Persistence | Session-only; Reset World regenerates from a fresh seed |

## Visual direction

- Pixel-art grass, dirt, stone, and sand textures are generated with Canvas pixels at startup, then tiled in Three.js materials.
- Low-poly tree canopies and cubic terrain preserve the voxel look.
- A warm directional sun, hemisphere ambient light, fog, and PCF soft shadows supply readable soft-daylight contrast.
- Water uses transparent blue material and subtle vertex-wave motion.

## Acceptance criteria

- Opens directly as a single local HTML file in a current desktop browser.
- All requested block types, interactions, controls, pause options, terrain types, physics, and visual treatments work.
- No external assets beyond the Three.js CDN import.
- Typical desktop hardware can navigate the initial world smoothly with visible-face chunk meshing.

## Implementation checkpoints

1. Scaffold the single-file app, textures, scene, HUD, and menu.
2. Implement terrain, trees, water, sand, and visible-face mesh builder. — complete
3. Add pointer-lock movement, voxel collision, raycast editing, hotbar, and particles. — complete
4. Add water animation, TNT/torch behavior, pause controls, performance tuning, and browser smoke test. — complete, with syntax validation; interactive browser smoke test awaits Playwright availability.
