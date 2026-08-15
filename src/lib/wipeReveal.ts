import { gsap } from 'gsap'

// ---- Wipe reveal ----------------------------------------------------------
// Text uncovers line by line under a travelling brand-gradient edge. Two
// variants, one motion:
//   bg   - solid-color text; the wipe is a sliding background-clip gradient
//          (see .u-wipe in index.css for the position math)
//   clip - gradient text (metallic headings, accent lines); background-clip
//          can't nest, so the base keeps its own gradient and a clip-path
//          window reveals it, with a brand-filled text copy as the edge
// One edge per LINE: per-character wipes flash every glyph at once and kill
// the sweep.

const TARGET_SELECTOR = 'h1, h2, h3, h4, p, blockquote, figcaption, li'
/** Constant edge speed everywhere; duration derives from line width. */
const EDGE_SPEED_PX_S = 400
const MIN_DUR_S = 0.8
const MAX_DUR_S = 1.9

type Mode = 'bg' | 'clip'

interface LineUnit {
  /** Everything the tween drives (line span, plus the edge copy for clip). */
  targets: HTMLElement[]
  width: number
}

interface Block {
  el: HTMLElement
  mode: Mode
  lines: LineUnit[]
}

/**
 * Only plain-text blocks (text nodes and <br>) get split. Links and controls
 * must never be wiped, and rich children make line grouping ambiguous.
 */
const isPlainText = (el: HTMLElement): boolean =>
  [...el.childNodes].every(
    (n) =>
      n.nodeType === Node.TEXT_NODE ||
      (n instanceof HTMLElement && n.tagName === 'BR')
  )

const isGradientText = (cs: CSSStyleDeclaration): boolean =>
  (cs.getPropertyValue('-webkit-background-clip') || cs.backgroundClip).includes('text')

const shouldSkip = (el: HTMLElement): boolean => {
  if (
    el.dataset.wipeDone === '1' ||
    !!el.closest('[data-no-wipe]') ||
    !!el.closest('.split-parent') ||
    !!el.querySelector('a, button, input, select, textarea, label') ||
    !isPlainText(el) ||
    !el.textContent?.trim()
  ) {
    return true
  }
  const cs = getComputedStyle(el)
  if (isGradientText(cs)) return false // clip variant handles it
  // Genuinely invisible text (transparent fill without a clip) stays alone.
  const alpha = /rgba?\([^)]*,\s*([\d.]+)\)$/.exec(cs.color)
  return alpha !== null && parseFloat(alpha[1]) === 0
}

interface Word {
  text: string
  /** A <br> in the source forced a break before this word. */
  brBefore: boolean
}

const collectWords = (el: HTMLElement): Word[] => {
  const words: Word[] = []
  let pendingBr = false
  for (const n of el.childNodes) {
    if (n instanceof HTMLElement && n.tagName === 'BR') {
      pendingBr = true
      continue
    }
    for (const t of (n.textContent ?? '').split(/\s+/)) {
      if (!t) continue
      words.push({ text: t, brBefore: pendingBr })
      pendingBr = false
    }
  }
  return words
}

/**
 * Split a block into shrink-wrapped line spans (a full-width span would make
 * the edge sweep empty space after short lines). Grouping measures word tops;
 * source <br>s are preserved as hard breaks. For gradient text the element's
 * own gradient moves onto each line (nested clips don't paint), and each line
 * gets an aria-hidden brand-filled copy as the travelling edge.
 */
function splitBlock(el: HTMLElement): Block {
  const cs = getComputedStyle(el)
  const mode: Mode = isGradientText(cs) ? 'clip' : 'bg'
  const finalColor = cs.color
  const gradient = cs.backgroundImage

  el.dataset.wipeOriginal = el.innerHTML
  el.dataset.wipeStyle = el.getAttribute('style') ?? ''
  const words = collectWords(el)

  // Measure pass: word spans (inline-block so words never break mid-glyph),
  // with the source's hard breaks in place so offsetTop grouping honors them.
  el.textContent = ''
  const measures = words.map((w) => {
    if (w.brBefore) el.appendChild(document.createElement('br'))
    const s = document.createElement('span')
    s.style.display = 'inline-block'
    s.textContent = w.text
    el.appendChild(s)
    el.appendChild(document.createTextNode(' '))
    return s
  })
  const groups: { words: string[]; brBefore: boolean }[] = []
  let lastTop = -Infinity
  measures.forEach((s, i) => {
    if (Math.abs(s.offsetTop - lastTop) > 1) {
      groups.push({ words: [], brBefore: words[i].brBefore })
      lastTop = s.offsetTop
    }
    groups[groups.length - 1].words.push(words[i].text)
  })

  // The parent's own gradient paint has to go while lines carry it, or the
  // two clips nest and nothing paints. Restored with the original DOM.
  if (mode === 'clip') {
    el.style.backgroundImage = 'none'
  }

  el.textContent = ''
  const lines = groups.map((g) => {
    if (g.brBefore) el.appendChild(document.createElement('br'))
    const line = document.createElement('span')
    line.textContent = g.words.join(' ')
    line.style.setProperty('--wipe', '0')
    const targets: HTMLElement[] = [line]
    if (mode === 'clip') {
      line.className = 'u-wipe-clip'
      line.style.backgroundImage = gradient
      line.style.webkitBackgroundClip = 'text'
      line.style.backgroundClip = 'text'
      line.style.color = 'transparent'
      const edge = document.createElement('span')
      edge.className = 'u-wipe-edge'
      edge.textContent = line.textContent
      edge.setAttribute('aria-hidden', 'true')
      edge.style.setProperty('--wipe', '0')
      line.appendChild(edge)
      targets.push(edge)
    } else {
      line.className = 'u-wipe'
      line.style.setProperty('--wipe-final', finalColor)
    }
    el.appendChild(line)
    el.appendChild(document.createTextNode(' '))
    return { targets, width: 0 }
  })
  // Widths after the final DOM settles.
  for (const l of lines) l.width = l.targets[0].offsetWidth
  return { el, mode, lines }
}

/** Post-reveal the block returns to its original DOM and inline style, so
 *  selection, resize and re-renders behave as if nothing happened. */
function restore(block: Block): void {
  const { el } = block
  if (el.dataset.wipeOriginal !== undefined) {
    el.innerHTML = el.dataset.wipeOriginal
    delete el.dataset.wipeOriginal
  }
  if (el.dataset.wipeStyle !== undefined) {
    if (el.dataset.wipeStyle) el.setAttribute('style', el.dataset.wipeStyle)
    else el.removeAttribute('style')
    delete el.dataset.wipeStyle
  }
}

function reveal(block: Block): void {
  // The clip window is 6 wide past the boundary; overshoot so it fully exits.
  const end = block.mode === 'clip' ? 106 : 100
  // Long paragraphs tighten the stagger so they don't take forever.
  const n = block.lines.length
  const stagger = n > 6 ? 0.06 : n > 3 ? 0.1 : 0.14
  block.lines.forEach((line, i) => {
    const dur = Math.min(MAX_DUR_S, Math.max(MIN_DUR_S, line.width / EDGE_SPEED_PX_S))
    // Tweens go straight on the elements: a child timeline played AND added
    // to a parent gets two playheads and stalls mid-line.
    gsap.to(line.targets, {
      '--wipe': end,
      duration: dur,
      ease: 'power1.inOut',
      delay: i * stagger,
      onComplete: i === n - 1 ? () => restore(block) : undefined,
    })
  })
}

const pending = new Map<HTMLElement, Block>()

/**
 * Reveal any still-pending blocks inside a container. For content whose
 * visibility is choreographed by its section (a [data-wipe-manual] ancestor),
 * the viewport observer is wrong: it fires while the block sits at opacity 0
 * and the sweep plays invisibly. The section calls this at its own reveal
 * moment instead. Idempotent.
 */
export function triggerWipe(container: HTMLElement): void {
  for (const [el, block] of [...pending]) {
    if (container.contains(el)) {
      pending.delete(el)
      reveal(block)
    }
  }
}

/**
 * Apply the wipe reveal to every eligible text block on the page. Call once
 * after fonts are ready (line measurement depends on final metrics).
 */
export function initWipeReveal(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const els = [...document.querySelectorAll<HTMLElement>(TARGET_SELECTOR)].filter(
    (el) => !shouldSkip(el)
  )
  if (!els.length) return

  for (const el of els) {
    el.dataset.wipeDone = '1'
    pending.set(el, splitBlock(el))
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        io.unobserve(entry.target)
        const block = pending.get(entry.target as HTMLElement)
        pending.delete(entry.target as HTMLElement)
        if (block) reveal(block)
      }
    },
    // ~"top 88%": the block starts revealing once it's 12% up from the fold.
    { rootMargin: '0px 0px -12% 0px' }
  )
  // Manually-triggered sections own their reveal moment.
  for (const el of els) {
    if (!el.closest('[data-wipe-manual]')) io.observe(el)
  }
}
