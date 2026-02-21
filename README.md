# CAIN PWA Starter

This repository contains a minimal Progressive Web App (PWA) starter that deploys cleanly on GitHub Pages.

## Files

- `index.html`: App shell
- `styles.css`: Basic styling
- `app.js`: Service worker registration + install button behavior
- `sw.js`: Offline caching service worker
- `manifest.webmanifest`: PWA metadata
- `icons/icon.svg`: App icon
- `.nojekyll`: Prevents Jekyll processing on GitHub Pages

## Local test

Use a local static server (service workers require http/https):

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
