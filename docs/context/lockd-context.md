# LOCKD — Master Context Document

Last updated:
Purpose:
This file is the primary context source explaining what LOCKD is, how it works, who it serves, product philosophy, features, architecture direction and behavioral principles.

Claude should read this document before making important product, UI, feature or architecture decisions.

---

# 1. WHAT IS LOCKD?

LOCKD is a mobile-first behavioral control system.

LOCKD helps users:

- resist urges
- break bad habits
- regain control
- build consistency
- understand triggers
- reduce relapses
- become more aware of behavioral patterns

LOCKD is NOT:

- therapy
- addiction treatment
- mental healthcare
- social media
- productivity SaaS
- generic habit tracker

LOCKD SHOULD FEEL LIKE:

- premium
- private
- calm
- direct
- emotionally intelligent
- supportive
- confrontational when useful
- high trust
- mobile-native

Main promise:

> Help users at the moment they struggle, not only after failure.

---

# 2. TARGET USERS

Primary users:

People struggling with:

- porn
- smoking
- weed
- binge eating
- doomscrolling
- alcohol
- gambling
- overspending
- snoozing
- excessive social media
- unhealthy routines

Common characteristics:

- self-aware
- ambitious
- ashamed of patterns
- want more control
- often hide struggles
- interested in self improvement

---

# 3. CORE PRODUCT PRINCIPLES

LOCKD follows these principles:

1.

The app should intervene BEFORE relapse.

NOT:

Track failure.

BUT:

Interrupt failure.

---

2.

The app must be useful without premium.

---

3.

Privacy first.

Users must control:

- what is shared
- with whom
- when

---

4.

Accountability ≠ social media

No:

- feeds
- likes
- comments

Only:

small trusted circles

---

5.

AI should be:

- short
- useful
- practical
- non-therapeutic

---

6.

Reflections should feel:

NOT:
homework

BUT:
clarity

---

7.

Every feature should reduce friction.

---

# 4. MAIN PRODUCT FLOW

Ad

↓

Landing page

↓

Account creation

↓

Onboarding

↓

Dashboard

↓

Daily usage

↓

Urge intervention

↓

Reflection

↓

Insights

↓

Consistency

↓

Optional premium

---

# 5. ONBOARDING FLOW

Purpose:

Build behavioral profile.

Steps:

1.
Identity intro

2.
Select bad habits

3.
Desired outcomes

Examples:

- discipline
- calm
- focus
- confidence

4.
Risk moments

Examples:

- night
- stress
- alone

5.
Warning signs

Examples:

- boredom
- loneliness
- tired

6.
 Support preferences

Examples:

- direct
- calm
- confronting

7.
Accountability selection

8.
Profile summary

---

# 6. CORE FEATURES

## Dashboard

Shows:

- current streak
- habits
- progress
- risk reminders
- impact stats
- struggle button

---

## "Ik struggle nu"

Main intervention feature.

User selects:

- urge reason
- context

App responds:

- reflection
- consequence projection
- intervention

Possible interventions:

- breathing
- timer
- walking
- journaling
- buddy
- cold shower

---

## Reflections

Daily reflection:

Mood

What went well

What was hard

Lesson

Tomorrow intention

---

## Accountability

Private circle.

Possible:

- support signals
- streak visibility
- struggle alerts

Never:

- reflection sharing
- AI sharing

---

# 7. PREMIUM STRATEGY

Free:

- habits
- dashboard
- interventions
- basic reflections

Premium:

- accountability
- circle
- deep insights
- advanced AI
- weekly reports

Potential:

€9.99 monthly

OR

lifetime offer

---

# 8. DESIGN PHILOSOPHY

LOCKD UI should feel:

- dark
- premium
- app-first
- emotional
- calm
- futuristic
- minimal

Reference:

Existing LOCKD mockups.

Never:

Generic SaaS.

---

# 9. DESIGN TOKENS

Background:

#05060A

Surface:

#10121A

Purple:

#8B5CF6

Text:

#FFFFFF

Muted:

#A1A1AA

---

# 10. MOCKUP SCREENS

Existing mockups:

Landing
Dashboard
Onboarding
Urge flow
Circle
Profile
Reflections
Accountability
Ads

Stored in:

/public/mockups/

Mockups are visual source of truth.

Do not redesign without reason.

---

# 11. DATABASE PHILOSOPHY

Everything links through:

user_id

Important entities:

profiles

behavior_profiles

user_habits

habit_logs

urge_events

reflections

interventions

accountability

insights

---

# 12. EVENT MODEL

Track:

urge_started

intervention_used

relapse

reflection

support

checkin

Build insights from behavior.

---

# 13. FUTURE FEATURES

Potential:

AI coaching

Prediction:

"Tonight is high risk."

Emergency support

Voice mode

Wearables

---

# 14. THINGS LOCKD MUST NEVER BECOME

Never become:

therapy app

social platform

generic habit tracker

productivity app

motivation quote app

---

# 15. SUCCESS METRIC

User succeeds when:

less urges

more consistency

better awareness

more control

more honesty

---

# 16. CLAUDE RULES

When implementing:

Always:

- inspect existing code first
- preserve patterns
- prefer reusable components
- use TypeScript
- build mobile-first
- keep premium feel
- avoid unnecessary complexity
- run build checks
- protect privacy