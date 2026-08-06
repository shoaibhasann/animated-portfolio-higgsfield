# animated-portfolio-higgsfield

Personal portfolio for **Shoaib Hasan** — Full-Stack Developer & AI Solutions.

A character-driven site where a 3D avatar carries the visitor through the page:
he walks into the hero, works at a desk in the About section, browses a
holographic tablet beside the project deck, rides an elevator through the
testimonials, and hands over a business card on a rooftop at the end. Every
clip is generated, background-removed where needed, and driven by scroll.

Live: [iamshoaib.tech](https://iamshoaib.tech)

## Stack

- React 18 + TypeScript (strict) + Vite
- Tailwind CSS v3
- `motion/react` (Framer Motion v12) for scroll choreography
- GSAP + ScrollTrigger + SplitText for text reveals
- Generated media: Higgsfield (Seedance 2.0 for video, nano-banana-pro for stills)

## Running it

```bash
npm install
npm run dev
```

```bash
npm run build
```

## How the motion works

**Scroll-scrubbed video.** The elevator, rooftop and footer-drift sections map
`useScroll` progress onto `video.currentTime`. Those clips are encoded
all-intra (`-g 1`) so every frame is a keyframe and seeking stays
frame-accurate. Because the transforms are pure functions of progress, the
whole sequence plays backwards when you scroll up.

**Transparent characters.** The hero and About clips are VP9-alpha WebM with an
HEVC-alpha MOV fallback for Safari, so the avatar composites straight onto the
page background with no matte box.

**Text reveals.** One `SectionIntro` component drives every heading so no two
sections reveal differently. Gradient headings move their
`background-clip: text` onto the split characters during the tween — with the
gradient only on the parent, split children have a transparent fill and the
animation runs invisibly.

Everything respects `prefers-reduced-motion`.

## Layout

```
src/
  sections/     one file per page section
  components/   shared animation primitives (SplitText, BlurText, FadeIn, ...)
  data/         projects, services, socials, asset paths
  styles/       brand gradient constants
public/         generated video and image assets
```
