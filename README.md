# CAIN Neon Sheet (PWA Scaffold)

Mobile-first Progressive Web App scaffold for a cyberpunk TTRPG character sheet.

## What this template includes

- Mobile-first character sheet layout with tabbed sections.
- PWA install support (`manifest.webmanifest` + `sw.js`) for GitHub Pages hosting.
- Offline app-shell caching.
- Effect system for panel-specific overlays:
  - `TV Static` (`fx-static`)
  - `Scanlines` (`fx-scanlines`)
  - `Glitch Shift` (`fx-glitch`)

## Files

- `index.html`: App shell and character sheet panels.
- `styles.css`: Cyberpunk visual system + effect classes.
- `app.js`: Data rendering, tabs, PWA install flow, and effect controls.
- `sw.js`: Offline caching service worker.
- `manifest.webmanifest`: PWA metadata.
- `icons/icon.svg`: App icon.
- `.nojekyll`: Prevents GitHub Pages Jekyll processing.

## Local run

Service workers require HTTP/HTTPS:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Applying visual effects programmatically

The app exposes a small API on `window.CAINFx`:

```js
window.CAINFx.listTargets();
window.CAINFx.apply("skills", "static", 4);
window.CAINFx.apply("weapons", "scanlines", 2);
window.CAINFx.clear("skills");
```

Accepted effect types: `none`, `static`, `scanlines`, `glitch`.
