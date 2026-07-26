# Awake Design Language

Awake should feel like entering a calm living place. It is reflective,
organic, spacious, and quietly responsive. It must never resemble a
productivity dashboard.

## Principles

1. Nature over software. Prefer depth, atmosphere, organic balance, and
   familiar language over panels, metrics, and administration.
2. Calm over productivity. Interfaces support attention without creating
   urgency.
3. Atmosphere over themes. Color changes the surrounding light; it does not
   recolor every object indiscriminately.
4. Light over shadows. Surfaces separate through tint, borders, and reflected
   light. Shadows are broad, pale, and rare.
5. Breathing over bouncing. Motion expands, settles, drifts, and fades.
6. Foundations over features. Navigation starts from parts of life and the
   systems that support them.
7. Systems over tasks. Actions are care offered to a system, not items to
   conquer.
8. Reflection over streaks. Show what was learned and what needs review; never
   manufacture pressure with scores or streaks.
9. Simplicity over configuration. Offer a small number of meaningful choices
   and generate the supporting design automatically.

## Atmospheres

Atmospheres are coordinated starting places. A person may choose any anchor
hue; these families provide calm defaults.

| Family | Character | Anchor | Default harmony |
| --- | --- | ---: | --- |
| Forest | grounded, restorative | 146° | Soft contrast |
| Ocean | spacious, steady | 205° | Close harmony |
| Dawn | warm, hopeful | 28° | Soft contrast |
| Midnight | quiet, enveloping | 226° | Close harmony |
| Hearth | held, familiar | 18° | Balanced |
| Bloom | tender, expressive | 326° | Soft contrast |

Every family generates separate light and dark values. A family is never a
fixed collection of hex colors.

## Semantic color

Components consume roles, never raw palette values:

- `page`: the surrounding atmosphere.
- `page-tint`: the solid fallback behind the atmosphere.
- `surface`: a quiet region within the page.
- `surface-elevated`: forms, cards, menus, and dialogs.
- `surface-subtle`: grouping without a container.
- `text`, `text-secondary`, `text-muted`: reading hierarchy.
- `accent`, `accent-contrast`, `accent-soft`: primary action and selection.
- `companion`: reflection, depth, and subtle contrast.
- `border`, `border-strong`: separation and control outlines.
- `focus`: keyboard focus and interactive orientation.
- `navigation`: active navigation language.
- `orb-highlight`, `orb-glow`, `inactive`: living-system depth.
- `danger`, `danger-soft`: destructive actions only.

Body text and controls target WCAG AA (4.5:1). Large display text and essential
graphical controls target at least 3:1. State is never communicated by color
alone.

## Typography

Awake uses Geist Sans for a humane, neutral voice.

| Role | Size | Weight | Line height |
| --- | ---: | ---: | ---: |
| Display | clamp(2.25rem, 7vw, 3.5rem) | 600 | 1.08 |
| Page title | clamp(1.875rem, 5vw, 2.5rem) | 600 | 1.14 |
| Section title | 1.375rem | 600 | 1.25 |
| Card title | 1rem | 550 | 1.4 |
| Body | 1rem | 400 | 1.65 |
| Supporting | 0.875rem | 400 | 1.6 |
| Label | 0.75rem | 550 | 1.4 |

Uppercase labels are short and use restrained tracking. Paragraph measure
should remain near 65 characters.

## Spacing, radius, and elevation

Spacing follows a 4px base: 4, 8, 12, 16, 20, 24, 32, 40, 48, and 64px.
Controls use a 14px radius, cards 24px, and dialogs 32px. Pills are reserved
for filters, compact status, and primary navigation.

Elevation has three levels:

- Ground: no shadow; atmosphere and spacing provide separation.
- Resting: a faint border and broad 8–24px reflected shadow.
- Raised: dialogs and temporary overlays only, using a broad 18–48px shadow.

Never stack multiple heavy shadows.

## Motion

- Settle: 180ms for control feedback.
- Flow: 320ms for surfaces, color, and layout.
- Breathe: 6–9 seconds for ambient orb movement.
- Hold: 750ms for the breathing-space gesture.

Use ease-out for arrival and ease-in-out for breathing. Avoid bounce, spring,
shake, celebratory confetti, and motion that implies reward. Reduced-motion
mode removes ambient movement while preserving state through label, opacity,
depth, border, or icon.

## Orbs

Orbs represent living systems, not completion.

- Identity hue belongs to the foundation or system.
- Highlight suggests reflected light.
- Companion hue appears only in glow or aura.
- Maturity changes depth, not identity.
- Activity strengthens light; it does not change hue.
- Review adds a clear, non-alarming marker and label.
- Mine adds a star independently of lifecycle state.
- Paused retains depth with lower saturation and glow.
- New uses calm amber with a trace of identity.
- Quiet is softer, never failed.

Every interactive orb is a real link or button with a complete accessible
name and a visible text label.

Orb material is an atmosphere-tinted rendering choice, never a separate
palette. Glass is the calm default. Pearl softens reflection, Mist reduces
contrast, Frost adds a pale edge, Glow strengthens aura, Aurora introduces a
subtle companion reflection, and Matte removes most shine. Materials must not
change lifecycle meaning.

## Surfaces and components

- Pages use `awake-page`.
- Content regions use `awake-surface`; discrete records use `awake-card`.
- Primary actions use `awake-button awake-button-primary`.
- Secondary actions use `awake-button awake-button-secondary`.
- Quiet actions use `awake-button awake-button-quiet`.
- Destructive actions use `awake-button awake-button-danger` and require the
  existing confirmation flow.
- Filters use `awake-chip` and `aria-pressed`.
- Inputs use persistent labels; placeholders are examples, not labels.
- Dialogs have one title, concise supporting copy, and clear Save/Cancel order.
- Navigation is compact, stable, and oriented around Foundations, Systems,
  Reflection, Privacy, and About—not feature inventories.

## Empty-state language

An empty state is an invitation, not an error.

- State what is absent without blame: “No systems yet.”
- Explain one gentle next action only when needed.
- Use “Nothing needs review right now,” never “You are all caught up.”
- Avoid productivity, failure, overdue, score, streak, and achievement
  language.
- Do not add decorative illustration unless it clarifies the next action.

## Foundation identity

Foundation identity is derived from the selected Awake atmosphere plus a
stable semantic hue offset. It influences page light, the center orb, system
highlights, and quiet accents. Custom foundation names receive a deterministic
offset derived from their title. Foundation identity never replaces system
identity or lifecycle meaning.

## Accessibility standard

- Text contrast: 4.5:1 minimum; large text: 3:1.
- Interactive targets: at least 44×44px.
- Keyboard focus: 2px visible ring plus offset; never color-only.
- Status: always include text, icon, depth, or opacity in addition to color.
- Reading order follows DOM order even in organic layouts.
- Respect reduced motion, increased text size, zoom, and narrow screens.
- Forms retain visible labels and understandable error text.
- Dialogs trap focus through their implementation and return focus on close.

## Governance

New UI must use semantic tokens or the standard component classes. Raw
Stone/Slate/Gray utilities and literal colors are compatibility-only and
should not be introduced in new work. Product behavior and data semantics
must not be encoded into presentation tokens.
