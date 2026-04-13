# GitLogger Frontend Copilot Instructions

## Build, test, and lint

No build, test, or lint commands are checked into this repository. There is no `package.json`, test runner, or lint configuration yet.

For local preview, use the existing VS Code workspace setting that points Live Preview at `docs/index.html`, or open `docs/index.html` directly in a browser.

## High-level architecture

This repository is currently a static frontend sketch. The working app surface lives under `docs/`.

- `docs/index.html` is the page entry point.
- `docs/css/base.css` is the main stylesheet loaded by the page.
- `docs/css/base.css` imports `docs/css/iceberg-dark.css`, which centralizes the color palette, semantic color classes, and shared utility-style classes.
- `docs/img/` contains the SVG assets intended for the UI.
- `docs/img/screenshot/` contains screenshots of `GitLogger` charts
- `docs/js/` exists but is currently empty, so behavior is not yet implemented.
- `docs/template/template-index.html` is a scaffold copy of the page shell. Its relative stylesheet paths match the root `docs/` layout, so treat it as a source template to copy from rather than a page to preview in place.

## Key conventions

- `docs/data/metric-names.json` and `docs/data/metric-names.md` contain the same data in different formats. The JSON file is intended for programmatic consumption, and the Markdown file is intended for human readers. Keep them in sync when updating.
- Treat `docs/` as the published frontend root. New HTML, CSS, JavaScript, and image assets should stay there unless the repository structure is intentionally changed.
- Preserve the current layering of `index.html` -> `css/base.css` -> `css/iceberg-dark.css`. Keep theme tokens and reusable color classes in the theme file, and keep page-level styling in base or additional local stylesheets.
- Reuse CSS custom properties from `iceberg-dark.css` instead of hardcoding colors or fonts in markup.
- Keep the top-level page structure centered on the existing semantic regions: `<nav>`, `<article>`, and `<aside>`.
- The initial design intent in `plans/2026-04.FirstPrompt.md` is a minimal, centered layout that uses CSS variables and placeholder blocks for future imagery. Keep that direction unless the user asks for a broader redesign.
- If you change the main page shell, review both `docs/index.html` and `docs/template/template-index.html` so the runnable page and the scaffold do not drift unintentionally.
- Use GitHub-flavored Markdown for repository documentation files.
