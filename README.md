# CAIN Exorcist Ledger (PWA Scaffold)

Mobile-first Progressive Web App scaffold for a dark modern-horror TTRPG focused on exorcism dossiers.

## Included in this version

- Full re-theme to modern horror + religious investigative tone.
- Integrated Exorcist ID card in the Overview tab:
  - Template source: `Templates/CAIN-Exorcist-ID-Card-Blank.png`
  - Filled reference preview: `Examples/Comfort-ID.png`
  - Dynamic field overlay + portrait injection from `app.js`
- Effect system with targetable panel distortion:
  - `none`, `static`, `scanlines`, `glitch`, `distort`
- PWA install support and offline app-shell caching for GitHub Pages.

## Requested fonts

The stylesheet is configured to prefer these families:

- `Acumin Pro`
- `Cuasigothic`
- `Apex Mk2`
- `Fanzine`
- `Odachi`

`styles.css` uses local `@font-face` declarations (`src: local(...)`) and fallbacks.
If these fonts are installed on-device they will be used automatically.

## Files

- `index.html`: App shell, horror-themed layout, ID card composition.
- `styles.css`: Theme, typography, responsive layout, effect classes.
- `app.js`: Data rendering, ID card fill logic, effects API, PWA install flow.
- `sw.js`: Offline caching service worker.
- `manifest.webmanifest`: PWA metadata.
- `Templates/CAIN-Exorcist-ID-Card-Blank.png`: Blank ID card base.
- `Examples/Comfort-ID.png`: Filled visual reference.

## Local run

Service workers require HTTP/HTTPS:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Effect API

```js
window.CAINFx.listTargets();
window.CAINFx.apply("idcard", "distort", 4);
window.CAINFx.apply("rites", "static", 3);
window.CAINFx.clear("idcard");
```
