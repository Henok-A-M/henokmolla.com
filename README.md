# Henok Molla — Ice Cave Portfolio

A redesigned, one-page portfolio built with **React 19, TypeScript and Vite**.

## Experience
A 120-frame WebGL ice-cave sequence with depth-map pointer parallax, an animated frost-blue preloader, scroll-driven copy, frosted-glass cards, and an accessible custom cursor.

The content **is Henok Molla's real portfolio**. After the cinematic 380vh introduction, the site presents the existing biography, professional photo, eight technical skill cards, networking/cybersecurity projects, interactive VLAN diagram, evidence gallery, Journey section, and Contact links.

## Develop
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```
The build copies the existing `assets/` directory and security `_headers` into `dist/` for Cloudflare Pages. Configure Cloudflare Pages to use `npm run build` and output `dist`.

## Assets and accessibility
Cave JPEGs and depth WebPs are loaded via `new Image()` from the remote assets. Loading timeouts and missing-asset fallbacks ensure the portfolio is still accessible. WebGL canvases are created inside React effects and cleaned up, compatible with StrictMode. The design respects reduced-motion preferences and keeps original content without publishing Year Up United email or phone number.

## Privacy and security
No analytics are added to this rebuild. A strict Content Security Policy is maintained in `_headers`. Organization names are linked **only in My Journey**, not the logos.
