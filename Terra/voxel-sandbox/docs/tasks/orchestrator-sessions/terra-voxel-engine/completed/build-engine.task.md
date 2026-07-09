# Task: Build Terra Voxel Sandbox

## Objective

Implement `Terra/voxel-sandbox/index.html` as a complete, standalone Vanilla HTML5 + Three.js voxel sandbox matching `Terra/docs/features/VoxelSandboxEngine.md`.

## Requirements

- Use a Three.js CDN import only; no build tooling or external assets.
- Include procedural terrain (hills, trees, water, sand), cull hidden voxel faces, generated canvas pixel textures, soft directional shadows, and animated transparent water.
- Implement pointer lock controls, gravity, jump, shift slow/crawl, collision, block break/place, particle break effect, hotbar selection, and Escape menu.
- Keep all runtime code within the one HTML file.
- Update the feature brief to reflect the finished behavior.

## Definition of done

The file loads directly in a modern desktop browser and the listed controls and gameplay loop work without console errors.
