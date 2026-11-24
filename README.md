# Henok Molla — Portale-Inspired Portfolio

A cinematic personal website using **Vite + React 19 + strict TypeScript + GSAP 3.15 / ScrollTrigger**.

## Design and interaction

The opening experience uses the Portale visual references supplied by the site owner:

- Sunset desert image with illuminated translucent card, and a perspective-correct portal mapped to the original image's card corners.
- White percentage preloader and a growing center-origin photo entrance.
- Word-by-word animated network-security headline and professionally styled navigation.
- Pinned scroll transition that turns the portal toward the visitor, expands its white edge, and reveals a second bright screen with a floating pale-blue card.
- Pointer-responsive tilt on supported devices, glass cursor, reversible scrolling, and reduced-motion fallback.
- The complete personal portfolio remains below the interactive introduction: real About Me, 8 skill cards, 13 projects, VLAN illustration, Wireshark screenshots, My Journey, and contact buttons.

**The site is Henok Molla's portfolio, not a banking product.** Visual source imagery is provided by Uberdesigner/Portale; copy and navigation describe Henok's actual work and studies.

## Resolution

The provided desert asset is **4096 × 2640** and the floating card asset **1440 × 810**. Both use their full supplied resolution, with responsive layouts and normal browser scaling. These are *not native 8K images*; higher-detail source art would be required for true 8K native image fidelity.

## Develop and deploy

```bash
npm install
npm run dev
npm run build
```

Cloudflare Pages: build command `npm run build`, publish directory `dist`. This copies `assets/` and `_headers` into the deployment, preserving CSP and original evidence imagery.

## Notes

- Interactive visuals use referenced external assets, including `desert.webp`, `bank-card.webp`, and card SVGs.
- Image fetches report progress and decode before use. If assets fail, the intro still opens.
- React effects and GSAP contexts clean up under StrictMode.
- The Year Up United email is not published. Organization links are limited to their names in the My Journey section; logos remain unlinked.
- The `portale-8k-rebuild` Git branch holds the preview work, while the main branch remains the production site.
