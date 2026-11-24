# Henok Molla — Easylog-Inspired Portfolio

A fully responsive personal portfolio with an interactive hero based on the provided **Easylog** design prompt, using **Vite, React 19, strict TypeScript, GSAP 3.15, and Canvas 2D**.

## The hero

- A full-screen sky-blue gradient and the original paired 2752 × 1536 transparent log artworks.
- A pixelated 64 → 1 CSS-pixel intro that sharpens while the log settles from 2.6× zoom.
- A real image-byte-based percentage counter, waiting for the two decoded images and the Instrument Sans/Instrument Serif font faces.
- A GSAP introduction for the glass navigation, character-by-character headline, lead, bottom bar and CTA.
- On mouse devices, the bare log grows moss where the pointer moves. Motion stamps are spaced independently of frame rate; resting stamps keep moss under the pointer. Each stamp fades exponentially to avoid permanent trails.
- On touch devices, the full mossy artwork shows. Reduced-motion preferences skip the counter, pixelation and zoom.
- A custom trailing glass cursor on supported pointer devices.

The new hero preserves the supplied Easylog copy and assets. The sections **below** the hero remain Henok's actual About, Skills, Projects, My Journey and Contact content, including the professional portrait, eight skill cards, 13 project folders, screenshots and interactive labs. Navigation points to those working sections.

## Development

```bash
npm install
npm run dev
npm run build
```

Cloudflare Pages: build command `npm run build`, output directory `dist`. The build also copies `assets/` and security `_headers` into the published folder.

## Image quality

The provided log images are **2752 × 1536**, rendered at up to 2× the device pixel ratio. The code does not invent extra image detail or claim native 8K source resolution.

## Privacy and organization links

The Year Up United school email is not published. As requested, the organization names link out only in the My Journey section; their logos are visible but not links.
