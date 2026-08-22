# Art Landing — Design Spec

Date: 2026-08-23
Status: Approved

## Summary

Build a two-section, scroll-based landing page using React 19, TypeScript, Vite,
Tailwind CSS v4, and `motion/react` (Framer Motion). The page uses Manrope,
Italiana, and Marck Script fonts, with a video hero section and a red second
section featuring a cloud parallax transition.

## Decisions

- **Project location / name:** `E:/project/front/the-mortal-journey`
- **Animation library:** `motion` ^12, imported from `motion/react`.
- **Routing:** `react-router-dom` v7 (mirrors the `mortal-journey` reference).
- **CSS reset:** mortal-journey's custom no-preflight reset (Tailwind v4 theme
  + utilities only, manual base reset in `globals.css`).
- **Unspecified copy:** use English placeholder copy for the two paragraphs the
  source spec describes but does not provide.

## Tech Stack

| Item | Choice |
|---|---|
| Animation | `motion` ^12 (`motion/react`) |
| CSS | Tailwind v4 via `@tailwindcss/vite`, no-preflight |
| Routing | `react-router-dom` v7 |
| Language/build | TypeScript `~5.8`, Vite `^6`, `@vitejs/plugin-react` ^5 |
| Runtime | React ^19, React DOM ^19, `lucide-react` |

## Directory Structure

```
the-mortal-journey/
├── package.json
├── vite.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── index.html
├── .gitignore
├── docs/superpowers/specs/2026-08-23-art-landing-design.md
└── src/
    ├── main.tsx            # mount + import both CSS files
    ├── App.tsx             # <RouterProvider router={router}/>
    ├── router.tsx          # "/" -> HomePage
    ├── pages/home/HomePage.tsx        # <main> scroll container + two sections
    ├── components/landing/
    │   ├── LogoMark.tsx               # shared SVG logo (size/className props)
    │   └── sections/
    │       ├── VideoHeroSection.tsx   # first screen
    │       └── RedSection.tsx         # red second screen + cloud parallax
    └── styles/
        ├── tailwind.css   # @theme fonts + theme/utilities layers (no preflight)
        └── globals.css    # manual base reset (black bg, Manrope)
```

## CSS Strategy

`index.html` loads fonts with preconnect links and the Google Fonts stylesheet
for Manrope / Italiana / Marck Script.

`src/styles/tailwind.css`:

```css
@layer theme, base, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);

@theme {
  --font-manrope: "Manrope", sans-serif;
  --font-italiana: "Italiana", serif;
  --font-marck: "Marck Script", cursive;
}
```

`src/styles/globals.css` replicates mortal-journey's manual base reset with the
background changed to black and the root font set to Manrope, plus a
`.site-shell` helper.

## Components

### LogoMark

Shared SVG logo. `viewBox="0 0 120 120"`, white fill, path from the source spec,
accepts `size` and `className` props.

### VideoHeroSection

- `<section className="relative h-screen w-full flex-shrink-0 overflow-hidden">`
- Background video (absolute inset-0, z-10, object-cover, autoPlay loop muted
  playsInline) from the R2 URL in the source spec.
- Overlay `absolute inset-0 z-30 pointer-events-none`.
- Top-left logo block (flex row, SVG + tagline; desktop/mobile tagline variants).
- Left description (desktop only), two English placeholder paragraphs about SaaS
  automation.
- Top-right "Get started" pill button with hover `bg-white/10 backdrop-blur-[48px]`.
- Bottom heading (desktop/mobile variants), Italian font.

### RedSection

- `<section className="relative min-h-screen w-full bg-[#FF0000] flex flex-col z-10">`
- Receives `containerRef` prop.
- Two `motion.div` cloud overlays (desktop `hidden md:block`, mobile `md:hidden`),
  both absolute top-0 left-0 w-full z-[100] pointer-events-none `-translate-y-1/2`.
- Uses `useScroll({ container })` + `useTransform` for `cloudYDesktop`
  (0→-100 over 0→300 scroll) and `cloudYMobile` (0→-24).
- Content wrapper: LogoMark 80x80, uppercase paragraph, `S.P.D` signature in
  `font-marck`, two centered English placeholder paragraphs.
- Bottom video block with a top fade (`from-[#FF0000] to-transparent`).

### HomePage

- `<main ref={containerRef} className="h-screen overflow-y-auto overflow-x-hidden font-manrope bg-black relative">`
- Renders `VideoHeroSection` then `RedSection`, passing `containerRef` down.

## Data Flow

Static page, no backend. `HomePage` owns the scroll container ref; `RedSection`
consumes it for parallax. `LogoMark` is reused via props. Copy is local English
placeholder content.

## Error Handling

External cloud image uses `referrerPolicy="no-referrer"`; videos use
`autoPlay muted playsInline loop`. No user input or exceptional paths, so no
error boundary is needed.

## Testing

No unit-testable pure logic in this phase. Verification is `npm run build`
(`tsc -b && vite build`) passing and `npm run dev` manual visual check.
