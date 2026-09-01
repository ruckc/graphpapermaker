# Graph Paper Maker

A SvelteKit app for designing custom graph paper for print or planning workflows. It supports adjustable page size, margins, grid spacing, and merged columns such as a first column that spans 20 grid squares.

## Features

- Editable page width and height
- Adjustable page margins
- Grid spacing control
- Merged columns with start position and width configuration
- Live SVG preview
- Download as SVG for print or reuse

## Local development

```bash
mise install
npm install
npm run dev -- --open
```

## Production build

```bash
mise install
npm run build
npm run preview -- --open
```

## GitHub Pages deployment

This repository includes a GitHub Actions workflow that deploys the static SvelteKit app to GitHub Pages. The deployment target uses the repository name as the base path, so it will publish to `https://<username>.github.io/graphpapermaker/`.
