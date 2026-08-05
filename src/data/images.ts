// Hero character assets are served locally from /public — the Higgsfield CDN
// originals expire.
export const HERO_PORTRAIT_URL = '/jack-standing.png'

// Transparent walk-in video of the same character (Seedance image-to-video with
// the standing render as the locked end frame, background removed via per-frame
// segmentation). WebM = VP9 alpha (Chrome/Firefox/Edge), MOV = HEVC alpha (Safari).
export const HERO_WALK_VIDEO_WEBM = '/jack-walk.webm'
export const HERO_WALK_VIDEO_MOV = '/jack-walk.mov'

// Same character coding at a desk (Seedance 4K, identity-referenced), background
// removed per-frame — renders as a native transparent element in the About
// section. WebM = VP9 alpha, MOV = HEVC alpha (Safari).
export const ABOUT_CODING_VIDEO_WEBM = '/jack-coding.webm'
export const ABOUT_CODING_VIDEO_MOV = '/jack-coding.mov'

// Hero exit: starts frame-locked on the standing pose (start_image), walks off
// screen-right. Plays when the visitor scrolls out of the hero.
export const HERO_EXIT_VIDEO_WEBM = '/jack-exit.webm'
export const HERO_EXIT_VIDEO_MOV = '/jack-exit.mov'

// Projects "Holo-Presenter": the character casually browsing his holographic
// tablet beside the card deck. Starts and ends looking at the camera; the
// middle segment (head down, swiping) is looped while the visitor scrolls.
export const PROJECTS_BROWSE_VIDEO_WEBM = '/jack-browse.webm'
export const PROJECTS_BROWSE_VIDEO_MOV = '/jack-browse.mov'
export const PROJECTS_BROWSE_POSTER_URL = '/jack-browse-poster.png'

// "The Rooftop Handoff" contact: full-bleed night rooftop, scroll-scrubbed —
// the character turns, walks to camera and extends a blank glowing card that
// morphs into the real HTML contact card. All-intra H.264 for scrubbing.
export const CONTACT_ROOFTOP_VIDEO = '/rooftop.mp4'
// Closing shot: same scene with the business-card content baked onto the
// card he holds (nano-banana edit of the final frame) — dissolves in over
// the frozen clip and carries the mailto hotspot.
export const CONTACT_CARD_IMAGE = '/rooftop-card.webp'

// "The Elevator" testimonials: full-bleed cinematic clips, scroll-scrubbed.
// Intro: lift arrives -> character exits right -> camera dollies to the cab's
// back wall. Outro: camera pulls back out -> doors close. All-intra H.264 so
// frame-accurate scrubbing stays smooth.
export const ELEVATOR_INTRO_VIDEO = '/lift-intro.mp4'
export const ELEVATOR_OUTRO_VIDEO = '/lift-outro.mp4'

// Retired from the tech-logo belt (component removed) but the clips are kept:
// crank = flywheel-turning loop, rest = wipe-forehead break — reusable for the
// Idle Interrupt or a loading/404 gag later.
export const TECH_CRANK_VIDEO_WEBM = '/jack-crank.webm'
export const TECH_CRANK_VIDEO_MOV = '/jack-crank.mov'
export const TECH_REST_VIDEO_WEBM = '/jack-rest.webm'
export const TECH_REST_VIDEO_MOV = '/jack-rest.mov'

// "The Drift Out" footer: two Seedance 4K shots stitched. A red McLaren enters
// from the left and drifts out left, then swings around and charges back
// through its own tire smoke to park nose-on in the right half of the frame.
// The closing content condenses out of that smoke. Plays once on entry, then
// holds on its last frame, so a normal GOP encode is fine (no scrubbing).
export const DRIFT_VIDEO = '/drift.mp4'
export const DRIFT_POSTER = '/drift-poster.jpg'

export const ABOUT_MOON_ICON_URL =
  'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png'

export const ABOUT_3D_OBJECT_URL =
  'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png'

export const ABOUT_LEGO_ICON_URL =
  'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png'

export const ABOUT_3D_GROUP_URL =
  'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png'
