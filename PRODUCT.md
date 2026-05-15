# Product

## Register

product

## Users

People struggling with behaviors they want to control: porn, smoking, weed, binge eating, doomscrolling, alcohol, gambling, overspending, snoozing, excessive social media, unhealthy routines.

They tend to be self-aware, ambitious, and ashamed of their patterns. They hide their struggles. They want more control over themselves, and they read self-improvement, but the existing tools (habit trackers, therapy apps, motivational content) don't meet them where they actually fail: in the moment of urge, often late at night, alone, stressed, bored, or scrolling.

LOCKD reaches them on a phone, in the moment, with the screen they actually need.

## Product Purpose

LOCKD is a mobile-first behavioral control system. It helps people resist urges, break bad habits, regain control, build consistency, understand their triggers, and reduce relapses.

The core promise: **help users at the moment they struggle, not only after failure.**

LOCKD is not therapy, addiction treatment, mental healthcare, social media, productivity SaaS, or a generic habit tracker. It is closer to a private mirror with a clear voice — calm when you need calm, direct when you need direct, and always on the side of the version of you that wants to change.

Success means fewer urges, more consistency, more awareness, more control, and more honesty with oneself.

## Brand Personality

**Calm, direct, premium.**

- **Calm** — never alarmist, never preachy. The interface is the steady hand in a stressful moment. Restrained motion, generous breathing room, lower-stakes language.
- **Direct** — informal second person (je/jij in Dutch). Honest. Confrontational when useful, but never moralizing. The app says what is true, not what is comforting. No therapy-speak ("Hoe voel je je vandaag op een schaal van 1-10?"). Short, plain, present-tense.
- **Premium** — the craft itself reassures. Tight typography, deliberate color, no SaaS clichés. Every screen feels considered. The user trusts the tool because the tool clearly takes itself seriously.

Voice cues to keep:
- Second person, informal, present tense.
- One idea per screen. No paragraphs of motivational copy.
- Acknowledge struggle without pity ("Het was moeilijk met iets?" not "We weten dat dit zwaar is voor je.").
- Inline emphasis (the signature purple-highlighted word inside a white heading) carries the load that bold/italics would carry elsewhere.

## Anti-references

LOCKD should explicitly NOT look or feel like:

- **Generic SaaS dashboards** (Vercel/Linear admin clones, stat-card grids, sidebar nav, "Welcome back, here's your data" energy). LOCKD is a phone-first emotional tool, not a workspace.
- **BetterHelp / therapy-app clinical aesthetics** (soft teals, stock photos of diverse humans looking pensive, "you matter" copy, clinical reassurance language). LOCKD is not healthcare and must not borrow the tone.
- **Habit tracker grids** (Streaks, Habitify, Loop). Checkbox-streak gamification with colorful icon grids reduces behavior change to a points game. LOCKD goes deeper than tracking.
- **Social/feed apps** (avatars, likes, comments, infinite feeds, public profiles). LOCKD's "Circle" is 1–5 private trusted buddies — never a feed, never a public surface.
- **Motivation quote apps** (gradient backgrounds with bold sans-serif platitudes). LOCKD never moralizes or motivates abstractly.

## Design Principles

1. **Intervene before relapse, don't just track it.** Every screen earns its place by helping the user before the next slip, not by reporting on the last one. If a feature only describes the past, it's not pulling its weight.

2. **Useful without premium.** The free tier must genuinely work. Premium adds depth (deep insights, advanced AI, accountability circle), but the core promise — intervention in the moment — is free. The product earns trust before it asks for money.

3. **Privacy is the contract.** The user always controls what is shared, with whom, and when. Reflections are private by default. AI conversations are never shared. The interface itself signals this — explicit privacy markers on screens that touch the Circle.

4. **Accountability is not social media.** Small, trusted, private circles. Signals, not feeds. Support, not performance. If a pattern feels like Instagram, remove it.

5. **Every feature reduces friction in the hardest moment.** The "Ik struggle nu" button is one tap from anywhere. The urge flow is short. Reflections are five questions, not twenty. Friction is the enemy when the user is already losing the fight.

6. **Reflection is clarity, not homework.** Daily reflection feels like one honest breath at the end of the day, not a journaling chore. Short prompts, no obligation, no streak-shame for skipping.

7. **Speak honestly, not therapeutically.** Direct second person. Plain present tense. Confrontational when the truth helps; never preachy, never patronizing, never clinical. The tool is on the user's side AND tells them what's true.

## Accessibility & Inclusion

**WCAG AA**, with extra care for the moment that matters most.

- 4.5:1 contrast minimum for body text, 3:1 for large text — verified against the near-black background.
- `prefers-reduced-motion` respected for all transitions and ambient motion (gradient orbs, progress fills, icon animations).
- **Distress-state principle:** copy and primary CTAs must remain readable, large, and unambiguous when the user is in a vulnerable state (urge moment, late night, low light, one-handed). This means: no thin display weights for critical actions, no clever-but-ambiguous button labels, no decoration that competes with the action.
- Tap targets ≥44pt for any interactive element on the urge flow.
- Color is never the sole carrier of meaning (streak status, struggle state, mood — all reinforced with labels or icons).
