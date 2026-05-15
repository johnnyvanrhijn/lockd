---
name: LOCKD
description: Premium dark mobile-first behavioral control system. Calm, direct, private.
colors:
  background: "#05060A"
  surface: "#10121A"
  surface-elevated: "#151823"
  surface-glass: "rgba(255, 255, 255, 0.04)"
  border: "rgba(255, 255, 255, 0.08)"
  border-strong: "rgba(255, 255, 255, 0.14)"
  purple: "#8B5CF6"
  purple-bright: "#A78BFA"
  purple-glow: "rgba(139, 92, 246, 0.45)"
  success: "#4ADE80"
  warning: "#FB923C"
  danger: "#FB7185"
  info: "#22D3EE"
  foreground: "#FFFFFF"
  muted: "#A1A1AA"
typography:
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "3rem"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.25em"
rounded:
  sm: "12px"
  md: "18px"
  lg: "24px"
  xl: "32px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.purple}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.sm}"
    padding: "0 24px"
    height: "56px"
  button-primary-hover:
    backgroundColor: "{colors.purple-bright}"
    textColor: "{colors.foreground}"
  button-secondary:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.sm}"
    padding: "0 24px"
    height: "56px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.sm}"
    padding: "0 24px"
    height: "56px"
  card-glass:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "20px"
  card-glass-purple:
    backgroundColor: "{colors.purple}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "20px"
  chip-selectable:
    backgroundColor: "{colors.surface-glass}"
    textColor: "{colors.muted}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
  chip-selectable-selected:
    backgroundColor: "{colors.purple}"
    textColor: "{colors.purple-bright}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
  status-badge:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.muted}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  icon-badge:
    backgroundColor: "{colors.purple}"
    textColor: "{colors.purple-bright}"
    rounded: "{rounded.sm}"
    height: "40px"
    width: "40px"
  bottom-nav:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "8px"
---

# Design System: LOCKD

## 1. Overview

**Creative North Star: "The Steady Hand"**

LOCKD is the calm voice in a loud moment. The interface is a steady hand on the user's shoulder when everything else is pulling them toward the urge: late at night, alone, scrolling, stressed. Every surface is restrained, dark, and deliberately understated, with one signal color (Iris) that glows only where attention is earned. There is no ornamentation that doesn't carry meaning. There is no copy that doesn't carry weight.

The system is mobile-only. The viewport caps at 430px and never opens up to a desktop dashboard layout. The user is on their phone, in their hand, in their pocket, in their bed. The aesthetic respects that: thumb-sized targets, generous breathing room, content centered in a single column that scrolls under a fixed floating bottom navigation. Glass surfaces sit on a near-black ground with subtle radial gradients of Iris behind the content, so the screen feels lit from inside rather than painted on. Shadow is rarely structural; it is almost always glow.

LOCKD explicitly rejects the SaaS-dashboard reflex (no stat-card grids, no sidebar nav, no "Welcome back" energy), the therapy-app reflex (no soft teals, no clinical reassurance, no stock-photo warmth), the habit-tracker reflex (no checkbox streak gamification, no colorful icon grids), and the social-feed reflex (no avatars in a feed, no likes, no comments). It looks like a private tool that takes itself seriously.

**Key Characteristics:**
- **Single-column mobile shell** capped at 430px. No multi-pane layouts, ever.
- **Near-black ground with Iris glow.** Background `#05060A` lit by two fixed radial gradients of Iris (top center, bottom right).
- **Glass card as the default surface.** Translucent surface tone over background, soft border, large radius (18px), ambient drop-shadow.
- **Iris is the only attention color.** Solid Iris carries CTAs, active states, progress fills, and inline word emphasis inside headings. Everything else is neutral or semantic.
- **Inline word emphasis** is the signature typographic move: a single Iris-colored word inside an otherwise white heading ("Neem de **controle** terug").
- **Type is system-stack Geist.** No display/body pairing, no custom display font. One family, tight scale.
- **Glow over hard shadow.** Elevation is a soft colored glow, not a structural drop-shadow.

## 2. Colors: The Iris Palette

A near-black ground holds white type and one violet signal color. Semantic colors exist for state communication only and are never decorative.

### Primary

- **Iris** (`#8B5CF6`, approx `oklch(64% 0.227 295)`). The brand color and the only attention-grabbing hue in the system. Used on primary CTAs, the active state of every interactive element, progress fills, current-step indicators in onboarding, the inline emphasized word inside a heading, and the ambient radial-gradient glow behind hero content. Rare on purpose: when Iris appears, it means something.
- **Iris Bright** (`#A78BFA`, approx `oklch(72% 0.182 295)`). The higher-lightness sibling of Iris. Used as the lighter stop in the two-step vertical gradient of the Primary Button (`from-purple-bright to-purple`), as the foreground color of selected chips and icon badges where Iris itself becomes the background, and as the eyebrow color above section titles.
- **Iris Glow** (`rgba(139, 92, 246, 0.45)`). The semi-transparent glow value used in box-shadow tokens to give Iris-tinted elements a soft ambient halo. Never used as a fill color; only as a shadow ingredient.

### Semantic (state communication only)

- **Success Green** (`#4ADE80`). Locked-in streaks, "clean" status, success confirmations, and the success-tinted glow ring on success cards. Used as a `12%`-opacity background with `25%`-opacity border on Status Badges.
- **Warning Amber** (`#FB923C`). The "Struggling" state. Risk-zone progress bars. Warnings that aren't yet errors.
- **Danger Coral** (`#FB7185`). The "Off track" state. Relapse markers. Destructive action buttons. The danger-tinted glow ring on danger cards. Coral, not red: warm, not alarming, even when it carries the hardest message.
- **Info Cyan** (`#22D3EE`). Informational badges and AI insight accents. Used sparingly; never on its own as a CTA.

### Neutral

- **Background Ink** (`#05060A`). The deep near-black ground. Never the literal black `#000`. Faintly cooled toward Iris so the surface lights it warmly from above.
- **Surface** (`#10121A`). The card surface tone, rendered with `0.70` opacity over the background so the radial gradient bleeds through.
- **Surface Elevated** (`#151823`). The next layer up: secondary buttons, icon-badge tiles inside habit cards, the unfilled track of progress bars.
- **Surface Glass** (`rgba(255, 255, 255, 0.04)`). A whisper of light used for ghost button hovers and chip backgrounds at rest.
- **Border** (`rgba(255, 255, 255, 0.08)`) and **Border Strong** (`rgba(255, 255, 255, 0.14)`). Hairline strokes, never colored, never thicker than 1px.
- **Foreground** (`#FFFFFF`). The headline and body text color on dark surfaces. The maximum-contrast choice, kept because the distress-state principle demands readability in the urge moment.
- **Muted** (`#A1A1AA`). Secondary copy, descriptions under titles, time-since labels, supporting metadata.

### Named Rules

**The One Voice Rule.** Iris carries the attention layer and nothing else. If a screen has more than one "look-at-me" Iris element, one is wrong. Streaks, stat values, eyebrows, status pills, and most decorative accents are neutral (white or muted). The Primary CTA, the active onboarding step, the selected chip, the focused field, the progress fill: those earn Iris.

**The Inline Emphasis Rule.** Headings carry a single Iris-colored word inside an otherwise white sentence ("Neem de **controle** terug.", "Stop je slechtste **gewoontes**."). The emphasized word is the operative verb or noun of the sentence. Never two words. Never the whole sentence. Never gradient text on the wordmark or anywhere else.

**The Semantic-Color Sanctity Rule.** Success Green, Warning Amber, Danger Coral, Info Cyan never appear as decorative backgrounds, gradient stops, or icon tints unrelated to their meaning. Green is "you're locked in," not "this section is positive." Coral is "you're off track," not "this section is loud."

## 3. Typography

**Display / Body / Label Font:** Geist (variable, served by `next/font/google` as `--font-geist-sans`), with a fallback stack of `ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`.

**Mono:** Geist Mono (`--font-geist-mono`), available for monospace contexts (timestamps, codes, fixed-width labels) though rarely used today.

**Character:** One typeface, tight scale, large weight-vs-size contrast for hierarchy. Geist is a geometric sans with high readability at small sizes and a confident, modern feel at display sizes. Tracking is tightened on headings (`-0.01em` to `-0.02em`) so headlines read as a single object, and stretched on eyebrows (`0.25em`–`0.3em`, uppercase) so labels read as labels and never as titles.

### Hierarchy

- **Display** (`font-semibold 600`, `3rem` / `48px`, `1.05` line-height, `-0.02em` tracking). Hero wordmark and landing-page headlines only. One per screen, maximum.
- **Headline** (`font-semibold 600`, `1.875rem` / `30px`, `1.15` line-height, `-0.015em` tracking). Section heroes inside the app shell ("Wat wil je terugkrijgen?", "Profiel"). One per screen.
- **Title** (`font-semibold 600`, `1.25rem` / `20px`, `1.25` line-height). Card headlines, modal titles, the prompt of a reflection card.
- **Body** (`font-normal 400`, `0.875rem` / `14px`, `1.55` line-height). Default reading text. Foreground white for primary copy, Muted for supporting copy. Cap prose at 28–32ch on mobile; never let it run edge-to-edge of the column without a max-width.
- **Label** (`font-semibold 600`, `0.75rem` / `12px`, `0.25em` tracking, uppercase). Eyebrow labels above section titles, the Tokens / Buttons / Status badges section headers in the design-system playground, the time-of-day labels on onboarding tiles. Always Iris Bright when above a section, always Muted when above a metadata block.

### Named Rules

**The Single-Family Rule.** One typeface across the entire product. No display/body pairing. No serif. No script. No condensed display variant. The hierarchy comes from scale + weight + tracking, not from family contrast.

**The Tight-Headings, Loose-Labels Rule.** Tracking is negative on headlines and zero on body, but positive (and uppercase) on labels. The visual contrast between a `-0.02em` headline and a `0.25em` label is the secondary hierarchy carrier when weight and size aren't enough.

**The Distress-Readability Rule.** Primary CTA labels, "Ik struggle nu" copy, and any text on the urge flow stays at weight 500+ and size 14px+. Thin display weights are forbidden anywhere a user might need to read fast in a vulnerable moment.

## 4. Elevation

LOCKD's elevation system is **glow-first, shadow-second**. Surfaces don't sit on a layered stack of papers with hard drop-shadows; they emit. The screen feels lit from inside. A dark drop-shadow exists (`shadow-card`, `shadow-elevated`) for cards that need to read as separate objects in a stack, but the more characteristic move is a colored glow (Iris by default, Success/Danger when semantically loaded) that radiates from the element instead of falling beneath it.

The bottom navigation is the one place a heavier ambient shadow (`0 20px 60px -20px rgba(0,0,0,0.6)`) carries the lift, because the nav floats above the content and needs to read as separate without being tinted.

### Shadow Vocabulary

- **Card** (`box-shadow: 0 20px 50px -25px rgba(0, 0, 0, 0.7)`). The default ambient lift under a Glass Card. Negative spread plus large y-offset creates a deep, diffuse pool rather than a hard edge.
- **Elevated** (`box-shadow: 0 24px 60px -20px rgba(0, 0, 0, 0.85)`). Heavier ambient lift for cards on top of cards (rare; nested cards are still forbidden by the shared design laws — this is for true overlays like sheets and modals).
- **Glow** (`box-shadow: 0 0 60px -10px rgba(139, 92, 246, 0.45)`). The signature Iris halo. Applied to soft-glow Glass Cards and the Primary Button (paired with the card lift).
- **Glow Strong** (`box-shadow: 0 0 90px -10px rgba(139, 92, 246, 0.6)`). Hero glow for the highest-attention surface on a screen.
- **Glow Success** (`box-shadow: 0 0 60px -15px rgba(74, 222, 128, 0.45)`). Used only on success-tinted cards (locked-in confirmation, milestone reached).
- **Glow Danger** (`box-shadow: 0 0 60px -15px rgba(251, 113, 133, 0.45)`). Used only on danger-tinted cards (relapse acknowledgement, destructive confirmation).

### Named Rules

**The Glow-Over-Shadow Rule.** When in doubt, reach for `--shadow-glow` (Iris) before `--shadow-elevated` (black). LOCKD's depth is the radiance of the brand color, not a stack of layered paper.

**The One-Halo Rule.** A screen has at most one element wearing the strong glow. Multiple glowing elements compete and dilute the "look here" signal. The Primary CTA, or the hero card, or the active step indicator: one of them at full strength, the rest restrained.

## 5. Components

### Buttons

The button family has four variants and three sizes. All variants share the same shape (radius `12px` / `--radius-sm`), the same transition curve (`200ms` ease), the same focus ring (Iris Bright ring with 2px background-offset), and the same active-press scale (`0.98`).

- **Shape:** Rounded rectangle, `12px` radius. Same radius across all sizes; never pill-shaped, never sharp-cornered. Heights are `36px` (`sm`), `44px` (`md`), `56px` (`lg`).
- **Primary:** Vertical two-stop gradient from Iris Bright (top) to Iris (bottom). Foreground white. Drop-shadow with Iris-glow tint, intensified on hover. On hover, brightness lifts by `10%` and the glow grows. Default size is `lg`. Used for the one primary CTA on each screen, anchored at the bottom of the column on flow screens.
- **Secondary:** Surface-Elevated background at `70%` opacity with backdrop-blur, hairline border. Foreground white. On hover, opacity goes to `100%` and the border strengthens. Used when there's a primary action but secondary navigation also needs prominence ("Bekijk hoe het werkt" next to "Start gratis").
- **Ghost:** Transparent background, Muted foreground. On hover, the foreground becomes white and a barely-visible Surface-Glass background appears. Used for tertiary actions: "Skip for now", "Later doen", "Terug".
- **Danger:** Solid Danger Coral background, white foreground, Coral-glow drop-shadow. Used only for destructive confirmations (delete account, leave circle).

A loading state replaces the button label with a centered spinner while preserving the button's width, so the action doesn't jump when the user taps it. A disabled state drops opacity to `50%` and removes the active-scale transform.

### Status Badges

Pill-shaped (radius `9999px`), hairline-bordered, with a leading `6×6px` filled dot and a label. Two layers of tone: **semantic** (success, warning, danger, info, neutral) and **domain** (locked_in, struggling, off_track, clean, relapse). Domain tones are styled aliases of semantic tones (locked_in = success, struggling = warning, off_track / relapse = danger), with the exception of `clean` which uses Iris.

- Background is the tone color at `12%` opacity. Border is the tone color at `25%–30%` opacity. Foreground is the tone color at full saturation. Dot is the tone color at full saturation.
- Two sizes: `sm` (11px text, 4×2 padding) and `md` (12px text, 10×4 padding).
- Never used as decoration. The badge is always communicating a state the user needs to know.

### Mood Badges

Round, 36–48px diameter, with an emoji or icon inside and an optional state ring. Used in the daily reflection (`Sterk`, `Oké`, `Struggle`, `Zwaar`, `Geen idee`). When selected, a `2px` Iris ring appears around the badge and the background tints to Iris at `15%` opacity.

### Icon Badges

Square or round container (sized `sm` 32px / `md` 40px / `lg` 48px) holding a stroke icon. Tone variants: `purple` (Iris at `20%` background, Iris Bright foreground; the default), `success`, `warning`, `danger`, `info`, `neutral`. Used as the leading element of habit cards, list items, and onboarding tiles.

### Cards / Glass Cards

The Glass Card is LOCKD's universal container. Default tone is a `70%`-opacity Surface over the background, hairline border, ambient drop-shadow, `18px` radius. Variants:

- **Default:** Surface tint, border, `--shadow-card`.
- **Elevated:** Surface-Elevated at `80%` opacity, strong border. Used when a card needs to sit visually above the surrounding default cards.
- **Purple:** Iris-tinted border (`30%` opacity) and a diagonal Iris gradient from top-left at `15%` opacity to transparent. Optionally wears `--shadow-glow`. Used for the highest-attention card on a screen (the daily welcome, the AI insight, the hero CTA card).
- **Success / Danger:** Tone-tinted at `5%` opacity, tone-tinted border, optional `--shadow-glow-success` / `--shadow-glow-danger`. Used to communicate the card's semantic charge (streak milestone, off-track warning) when the badge alone isn't enough.

Internal padding: `none` / `sm 16px` / `md 20px` / `lg 24px`. Default is `md`. Interactive cards (a habit card that opens detail) add a hover treatment (border strengthens, surface-elevated takes over) and an active scale of `0.99`.

**Nested cards are forbidden.** If a card needs to contain a card, restructure: use a divided list inside the parent, or a Toggle Row, or an Icon Badge prefix instead.

### Selectable Cards & Chips

The two affordances for "pick one or many from a set."

- **Selectable Chip:** Pill-shaped, `14×6px` padding, `14px` font. At rest: Surface-Glass background, Muted foreground, hairline border. Selected: Iris border at `60%`, Iris background at `15%`, Iris Bright foreground. Active-press scale `0.97`. Used for tags and small multi-select sets (outcomes, support style).
- **Selectable Card:** Full-width card, `18px` radius, with an Icon Badge on the left, title + description in the middle, and a check-circle on the right. At rest: Surface at `70%` with hairline border. Selected: Iris border at `60%`, Iris background at `10%`, Iris-Bright check icon, Iris-glow halo at `40%` opacity. Used for larger choice sets in onboarding (habits, support preferences, accountability mode).

### Inputs

LOCKD's input vocabulary is currently selection-driven (chips, cards, toggles, sliders) rather than free-text. Where free-text inputs do appear (reflection prompts, custom habit name), they follow:

- **Background:** Surface-Elevated.
- **Border:** Hairline default; Iris on focus.
- **Radius:** `12px` (`--radius-sm`) for single-line, `18px` (`--radius-md`) for multi-line.
- **Padding:** `12×16px` minimum.
- **Focus:** Border shifts to Iris, a `2px` Iris-Bright ring appears with a `2px` background offset (the system-wide focus pattern).

### Toggle Row

A horizontal row of (label + description) on the left and a pill toggle on the right, divided from neighboring rows by a hairline. Used inside Glass Cards as the standard settings affordance. The toggle handle is white, the track is Iris when on and Surface-Elevated when off.

### Progress & Step Indicator

- **Progress Bar:** `8px` track at radius `9999px`, Surface-Elevated background, fill is a horizontal Iris-Bright→Iris gradient by default (or solid Success / Warning / Danger by tone). Animates fill change in `300ms`.
- **Step Indicator:** Horizontal row of pill segments, one per onboarding step, flex-1. Past + current segments are filled (current uses the Iris-Bright→Iris gradient; past use solid Iris). Future segments are Surface-Elevated. Always at the very top of an onboarding screen, above the eyebrow label.

### Bottom Navigation

The signature LOCKD chrome element. A floating bar with `32px` radius (`--radius-xl`), Surface at `80%` opacity, backdrop-blur, hairline border, and an ambient black drop-shadow (not glow, here, because the nav must read as floating over content rather than tinted by it). Fixed to the bottom of the viewport inside a `430px` max-width column, with safe-area-inset padding. Five tabs: Overzicht / Statistieken / Circle / Reflecties / Profiel. Active tab has an Iris-Bright icon and label. Inactive tabs have Muted icon and label.

### Signature Components

- **Habit Card.** Icon Badge on the left, name + streak / meta in the middle, Status Badge on the right. The most-touched card in the product.
- **Insight Card.** Eyebrow label, Icon Badge in a corner, title, body, and a Ghost Button action. Used for AI-generated pattern observations.
- **Buddy Card.** Initials avatar, name, status pill, last-active time, optional message Icon Button. The atom of the Circle screen.

## 6. Do's and Don'ts

### Do:

- **Do** use Iris on the one most important action of a screen, and let everything else be neutral.
- **Do** emphasize a single word in a heading with Iris (`text-purple` / `text-purple-bright`) instead of bolding, underlining, or coloring the whole line.
- **Do** reach for `--shadow-glow` before `--shadow-elevated` when an element needs to lift; glow is LOCKD's depth.
- **Do** cap content at `max-w-[430px]` and keep the layout single-column. The product is mobile-only.
- **Do** use Glass Card with default `padding="md"` as the universal container. Vary the tone (`default`, `elevated`, `purple`, `success`, `danger`) rather than inventing a new card type.
- **Do** use the system focus ring (`ring-2 ring-purple-bright/70 ring-offset-2 ring-offset-background`) on every interactive component. Consistency IS the affordance.
- **Do** keep tap targets at `44px` minimum, especially on the urge flow.
- **Do** keep semantic colors sacred to their meaning. Green is for locked-in. Coral is for off-track. Cyan is for info.
- **Do** respect `prefers-reduced-motion`. Disable ambient gradient drift, glow pulses, and progress-bar fill animation when set.
- **Do** name the brand purple "Iris" in design conversation and PR titles. The token slug stays `purple` for code compatibility.

### Don't:

- **Don't** use raw `#000` or `#fff` as a *new* color outside the token set. Foreground is `--color-foreground`, background is `--color-background`. If a designer reaches for white, route them to the token.
- **Don't** use gradient text (`bg-clip-text text-transparent`). This is on the absolute-bans list. The current home page applies a gradient to the "D" of LOCKD — that is a legacy violation and will be removed; do not propagate it. Replace with a solid Iris-Bright glyph or a single-color wordmark.
- **Don't** use side-stripe borders (`border-left: 4px solid Iris`) on cards, list items, callouts, or alerts. Use full borders, background tints, leading Icon Badges, or nothing.
- **Don't** nest cards. A Glass Card inside a Glass Card is always wrong; flatten the structure with a divided list, Toggle Row, or Icon Badge prefix.
- **Don't** introduce a second display typeface or a serif. One family.
- **Don't** ship a stat-card grid of identical metric tiles ("12 days", "4 urges", "21 wins"). That's the SaaS-dashboard reflex named in PRODUCT.md as an anti-reference.
- **Don't** style accountability features as a feed. No avatar grids, no comment rows, no like buttons. The Circle is private and signal-based.
- **Don't** use motion that doesn't convey state. No decorative entrance choreography, no bouncing, no elastic curves. Ease-out only.
- **Don't** use heavy ambient drop-shadow when a glow would do the work; LOCKD lights from inside, not from above.
- **Don't** put Coral (`#FB7185`), Amber (`#FB923C`), or any semantic color on a CTA that isn't destructive or critical. The Primary Button is Iris.
- **Don't** invent button shapes. All buttons are `--radius-sm` (`12px`). Pill buttons are reserved for chips and badges.
- **Don't** introduce glassmorphism on a non-card surface. Backdrop-blur is only for Glass Cards, the Bottom Nav, and the Secondary Button.
- **Don't** translate UI copy to English in product surfaces. LOCKD ships in Dutch first; second person, informal (je/jij), present tense.
