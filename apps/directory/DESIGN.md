# Red Zone Fantasy — Directory Design System

This document defines the design language for the Red Zone Fantasy directory application.
It is the source of truth for colors, typography, spacing, components, and patterns.

---

## Color Palette

All colors are applied as inline `style` props rather than Tailwind utilities to avoid
purge issues with dynamic class names. This ensures all shades are always available.

### Background Scale

| Token | Value | Usage |
|---|---|---|
| `bg-page` | `rgb(10,10,10)` | Page background (`min-h-screen`) |
| `bg-base` | `rgb(14,14,14)` | Section backgrounds, empty states |
| `bg-card` | `rgb(18,18,18)` | Cards, modals, inputs |
| `bg-elevated` | `rgb(26,26,26)` | Hover states, subtle chips |
| `bg-border` | `rgb(38,38,38)` | Default border color across all elements |
| `bg-strong-border` | `rgb(63,63,63)` | Checkbox/radio borders, stronger dividers |

### Text Scale

| Token | Value | Usage |
|---|---|---|
| `text-primary` | `rgb(255,255,255)` | Headings, high-emphasis labels |
| `text-secondary` | `rgb(163,163,163)` | Body copy, nav links |
| `text-muted` | `rgb(115,115,115)` | Timestamps, metadata, captions |

### Brand Colors

| Token | Value | Usage |
|---|---|---|
| `brand-red` | `rgb(220,38,38)` | Primary CTA, active states, accents |
| `brand-red-hover` | `rgba(220,38,38,0.1)` | Hover tint on red elements |
| `brand-red-border` | `rgba(220,38,38,0.3)` | Card border on hover |

### Category Colors (used on chips and badges)

| Category | Background | Text |
|---|---|---|
| Redraft | `rgba(59,130,246,0.15)` | `rgb(147,197,253)` |
| Dynasty | `rgba(168,85,247,0.15)` | `rgb(216,180,254)` |
| DFS | `rgba(34,197,94,0.15)` | `rgb(134,239,172)` |
| Best Ball | `rgba(234,179,8,0.15)` | `rgb(253,224,71)` |
| Tools | `rgba(20,184,166,0.15)` | `rgb(94,234,212)` |
| AI | `rgba(220,38,38,0.15)` | `rgb(252,165,165)` |
| Trade Analysis | `rgba(249,115,22,0.15)` | `rgb(253,186,116)` |
| Free | `rgba(34,197,94,0.15)` | `rgb(134,239,172)` |
| Freemium | `rgba(59,130,246,0.15)` | `rgb(147,197,253)` |
| Paid | `rgba(168,85,247,0.15)` | `rgb(216,180,254)` |

### Promo Code Accent

- Background: `rgba(234,179,8,0.08)` · Border: `rgba(234,179,8,0.3)` · Text: `rgb(253,224,71)`

---

## Typography

Font: System sans-serif stack (no custom font loaded). Tailwind's default font-sans.

| Element | Class |
|---|---|
| Page title | `text-3xl font-bold text-white` |
| Section heading | `text-xl font-bold text-white` |
| Card title | `font-semibold text-white` |
| Body | `text-sm` + `text-secondary` color |
| Caption / meta | `text-xs` + `text-muted` color |
| Badge / chip label | `text-[10px] font-medium` or `font-bold` |
| Monospace (promo code) | `font-mono font-bold` |

---

## Spacing

- Page horizontal padding: `px-4`
- Page max width: `max-w-5xl` (content pages) or `max-w-7xl` (homepage)
- Vertical page padding: `py-10` (inner pages), `py-12` (sections)
- Card internal padding: `p-4` (list rows) or `p-5`–`p-8` (featured cards)
- Gap between cards in a grid: `gap-5`
- Gap between list rows: `gap-3`

---

## Border Radius

| Element | Radius |
|---|---|
| Cards, sections | `rounded-xl` |
| Buttons | `rounded-lg` |
| Small chips / badges | `rounded-full` |
| Logo thumbnails | `rounded-lg` |
| Avatar thumbnails | `rounded-full` |

---

## Components

### Cards (List Row)

Used on Rankings and Tools directory pages.

```
bg: rgb(18,18,18)  border: rgb(38,38,38)  rounded-xl  p-4
Hover: border-color → rgba(220,38,38,0.4)
```

Structure: `[Logo 40×40] [Name + badges + description] [actions]`

### Cards (Featured Grid)

Used on Tools /tools featured section and content feed.

```
bg: rgb(18,18,18)  border: rgb(38,38,38)  rounded-xl  overflow-hidden
Hover: border-color → rgba(220,38,38,0.4) + shadow-lg
```

Structure: `[Logo area bg(14,14,14) p-8] [Name + price badge + description + promo]`

### Content Card

Used in the homepage feed.

```
aspect-video thumbnail · bg-card body · player chips · platform badge
```

Thumbnail fallback: Clearbit logo centered on `bg-card`, or letter avatar on `rgba(220,38,38,0.15)`.

### Filter Chips

```
Active:   bg: brand-red  text: white
Inactive: bg: rgb(26,26,26)  text: rgb(163,163,163)  border: rgb(38,38,38)
```

Use `rounded-full px-4 py-1.5 text-sm font-medium`.

### Search Input

```
bg: rgb(18,18,18)  border: rgb(38,38,38)  focus:border-red-600
py-2.5 pl-9 pr-4  rounded-lg  text-sm text-white  placeholder: neutral-500
SVG search icon at left-3
```

### Promo Code Badge (copyable)

```
border: rgba(234,179,8,0.3)  bg: rgba(234,179,8,0.08)  text: rgb(253,224,71)
rounded-lg px-3 py-1.5 text-xs font-medium
Shows clipboard icon → "Copied!" on success (2s timeout)
```

### Partner / Featured Badge

```
bg: rgba(234,179,8,0.15)  text: rgb(253,224,71)  rounded-full px-2 py-0.5 text-[10px] font-bold
Content: "★ Partner"
```

### Logo Resolution Order

1. Manual `logoUrl` override (set in Admin Command Center)
2. Google favicon service (`/s2/favicons?domain=…`) from URL hostname — see `src/lib/brandLogo.ts` (Clearbit’s public logo host is deprecated / unreliable)
3. Single-letter avatar with `rgba(220,38,38,0.15)` background

### Sidebar Filter Panel (FeedWithFilters)

Desktop: sticky `w-52` panel, `rounded-xl border p-4 bg(14,14,14)`.
Mobile: collapsible inline panel triggered by "Sources" chip.

---

## Page Layout Pattern

All inner pages follow:

```tsx
<div className="min-h-screen" style={{ background: 'rgb(10,10,10)' }}>
  <Navbar />
  <main className="mx-auto max-w-5xl px-4 py-10">
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-white">{title}</h1>
      <p className="mt-1 text-sm" style={{ color: 'rgb(115,115,115)' }}>{subtitle}</p>
    </div>
    {/* page content */}
  </main>
</div>
```

---

## Navbar

- Background: `rgb(10,10,10)` with bottom border `rgb(26,26,26)`
- Logo: "Red Zone Fantasy" bold white · "BETA" chip in red
- Nav links: `text-sm font-medium` · default `rgb(163,163,163)` · hover `white`
- Right side: "RosterMind AI →" muted link · UserButton (signed in) or "Sign In" button
- Account icon: `h-8 w-8` border button with person SVG (shows when signed in, links to `/account`)

---

## Animations

- Hover scale on card thumbnails: `transition group-hover:scale-105`
- Hover opacity on CTA buttons: `hover:opacity-90`
- Hover border color transitions: `transition-all`
- Pulsing badge: `animate-pulse` on the live indicator dot (hero section)

---

## Empty States

```
rounded-xl border(rgb(26,26,26)) bg(rgb(14,14,14)) py-16 text-center
text-sm text-muted
Optional: secondary link/button in brand-red below
```

---

## CTA Banner Pattern (RosterMind Promotion)

```
rounded-2xl border(rgba(220,38,38,0.3)) bg(rgba(220,38,38,0.05)) p-8 text-center
Radial gradient overlay: ellipse at 50% -20%, rgba(220,38,38,0.15)
```

Used at the bottom of the homepage to upsell RosterMind AI.
