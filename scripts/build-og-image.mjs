/**
 * Renders public/og-image.jpg — the card WhatsApp, LinkedIn, Slack and X show
 * when someone shares iamshoaib.tech.
 *
 *   node scripts/build-og-image.mjs
 *
 * Why a build-time file and not a server route: every crawler gets a static
 * JPEG, there is no cold start, and the file can be looked at before it ships.
 *
 * Why JPEG and not PNG: WhatsApp silently drops previews over roughly 300 KB.
 *
 * Rendered at 2400x1260, which is 2x the 1200x630 preview box, so the type stays
 * sharp when a client upscales it.
 *
 * Fonts are committed under scripts/og/fonts (Kanit, OFL) because satori does not
 * read system fonts — it throws without at least one, and a missing font renders
 * every glyph as a tofu box.
 *
 * satori is flexbox only: any element with more than one child needs an explicit
 * display: flex or it will not lay out.
 *
 * Re-run and commit the JPEG after changing the copy below.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import satori from 'satori'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const font = (file) => fs.readFileSync(path.join(ROOT, 'scripts/og/fonts', file))
const OUT = path.join(ROOT, 'public/og-image.jpg')

// Pulled off the live site rather than guessed: body background is rgb(12,12,12)
// and the dominant accent is the soft pink, with the emerald used for the
// availability marker.
const INK = '#0C0C0C'
const WHITE = '#FFFFFF'
const PINK = '#F3B8E9'
const GREEN = '#34D399'
const MUTED = 'rgba(255,255,255,0.62)'

const S = 2 // 2x scale
const px = (n) => n * S

const text = (content, style) => ({ type: 'div', props: { style, children: content } })

const element = {
  type: 'div',
  props: {
    style: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      backgroundColor: INK,
      padding: `${px(70)}px ${px(80)}px`,
      fontFamily: 'Kanit',
    },
    children: [
      // Top — role line
      {
        type: 'div',
        props: {
          style: { display: 'flex', alignItems: 'center' },
          children: [
            // A middle dot, not an ampersand: satori swallows the space before
            // "&" once letterSpacing is on, so it rendered as "FULL-STACK& APP".
            // The dot also matches the separator used in the stack line below.
            text('FULL-STACK · APP DEVELOPER', {
              fontSize: px(22),
              fontWeight: 600,
              letterSpacing: px(4),
              color: PINK,
            }),
          ],
        },
      },

      // Middle — name, rule, tagline
      {
        type: 'div',
        props: {
          style: { display: 'flex', flexDirection: 'column' },
          children: [
            text('SHOAIB HASAN', {
              fontSize: px(112),
              fontWeight: 700,
              color: WHITE,
              lineHeight: 1,
              letterSpacing: `-${px(2)}px`,
            }),
            {
              type: 'div',
              props: {
                style: {
                  width: px(88),
                  height: px(4),
                  backgroundColor: PINK,
                  marginTop: px(26),
                  marginBottom: px(26),
                  display: 'flex',
                },
              },
            },
            text('I build web and mobile products that ship.', {
              fontSize: px(34),
              fontWeight: 500,
              color: 'rgba(255,255,255,0.86)',
            }),
            text('Next.js · React Native · Node · AI integration', {
              fontSize: px(24),
              fontWeight: 500,
              color: MUTED,
              marginTop: px(14),
            }),
          ],
        },
      },

      // Bottom — domain, and the availability marker the site carries
      {
        type: 'div',
        props: {
          style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
          children: [
            text('iamshoaib.tech', { fontSize: px(26), fontWeight: 600, color: WHITE }),
            {
              type: 'div',
              props: {
                style: { display: 'flex', alignItems: 'center' },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        width: px(9),
                        height: px(9),
                        borderRadius: px(9),
                        backgroundColor: GREEN,
                        marginRight: px(10),
                        display: 'flex',
                      },
                    },
                  },
                  text('Available worldwide', { fontSize: px(22), fontWeight: 500, color: MUTED }),
                ],
              },
            },
          ],
        },
      },
    ],
  },
}

const svg = await satori(element, {
  // The design above is written in a 1200x630 space (the real preview box) and
  // every measurement goes through px(), so the canvas has to be scaled by the
  // same factor or the type comes out S times too big for the frame.
  width: px(1200),
  height: px(630),
  fonts: [
    { name: 'Kanit', data: font('Kanit-Medium.ttf'), weight: 500, style: 'normal' },
    { name: 'Kanit', data: font('Kanit-SemiBold.ttf'), weight: 600, style: 'normal' },
    { name: 'Kanit', data: font('Kanit-Bold.ttf'), weight: 700, style: 'normal' },
  ],
})

await sharp(Buffer.from(svg)).jpeg({ quality: 90, chromaSubsampling: '4:4:4' }).toFile(OUT)

const kb = Math.round(fs.statSync(OUT).size / 1024)
console.log(`wrote ${path.relative(ROOT, OUT)} — ${px(1200)}x${px(630)}, ${kb} KB`)
if (kb > 300) console.warn('WARNING: over 300 KB — WhatsApp may drop the preview. Lower the quality.')
