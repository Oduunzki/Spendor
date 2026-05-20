# Spendor — UI/UX refresh

Drop-in replacement for the files under `frontend/`. **No API or backend changes.** All routes, prop shapes, and TypeScript types preserved. AuthContext + every file under `src/api/` is untouched.

## What changed

### Visual language (toned down — matches the v2 mockup)
- **Palette**: neon `#22C55E` / `#EAB308` / `#EF4444` / `#8B5CF6` → mint `#6EE7A0` / muted gold `#E8C46A` / soft coral `#F5867B` / soft violet `#9D89E8`. Existing classnames (`text-green`, `bg-purple/20`, etc.) still resolve — Tailwind config remaps them.
- **Glows**: `shadow-green-glow` etc. are still defined but render as subtle drop-shadows, not neon halos.
- **Streak-glow animation**: from pulsing neon ring to a barely-visible 4px breathing border.
- **Typography**: IBM Plex Sans → **Nunito** (display + body) + **JetBrains Mono** for all numerals. New `.num` and `.label` CSS utilities for tabular numerals and small-caps labels.
- **Surface colors**: deepened to `#0E0D17` / `#1C1A28` / `#252335` / `#2A2740` to match the prototype.

### Component rewrites
| File | What changed |
| --- | --- |
| `tailwind.config.js` | Whole palette remapped. Old classnames keep working. |
| `src/index.css` | Nunito + JetBrains Mono load; subtle radial wash on body; new `.num` and `.label` utilities. |
| `index.html` | Title `ImpulseGuard` → `Spendor`; theme-color updated; fonts swapped. |
| `BottomNav.tsx` | **6 tabs → 5.** "Motstod" removed (it's the prominent green CTA on the dashboard) — gives bigger touch targets and a less cramped nav. Active state uses mint. |
| `StreakBadge.tsx` | Lucide `Flame` (filled yellow) → custom SVG flame with subtle 3s sway. No `streak-glow` halo. |
| `LevelProgress.tsx` | Removed `Lv.7` badge pill and the long "Sparemester / Pengeguru" level-name lookup table — now just "Nivå 7". Thin gold bar, no glow. |
| `CoachMessage.tsx` | Removed gradient bubble + Sparkles avatar — clean stripe + COACH label like the prototype. |
| `XpPopup.tsx` | Smaller gold pill, no yellow-glow shadow, plays once. |
| `CountdownTimer.tsx` | Same logic, calmer typography + bg colour. |

### Page rewrites
| File | What changed |
| --- | --- |
| `App.tsx` | Spinner accent matches new palette; pb-20 → pb-24 for new nav height. |
| `DashboardPage.tsx` | New layout matching the prototype: streak card → level/XP → "Spart i `<måned>`" hero with sparkline → coach → 3 raske handlinger. Greeting + first-name. Removed the big full-width green "Skann kvittering" hero buttons stacked vertically — they were too dominant. |
| `ResistedPage.tsx` | Stepwise (1→4) layout, amount **presets** (50/100/200/500/1000 + custom) instead of a single number field, calmer success state (no `🎉` emoji, mint check + tabular-num counter), tame confetti (60 particles, scalar 0.8, new palette). |
| `ScanReceiptPage.tsx` | Drop-zone with dashed purple corner marks instead of giant green square; calmer done state; bottom-padded for new nav. |
| `WaitingListPage.tsx` | Removed "Du har droppet X ting" tagline shouting; banner now leads with mint num + label. Item cards: countdown chip + category pill side-by-side; expired CTAs are bigger and labelled "Trenger det fortsatt" / "Trengte det ikke" — clearer than "Dropp det!" / "Kjøp likevel". FAB recoloured to muted gold (it's an add action, not a destructive). |
| `InsightsPage.tsx` | Chart palette swapped (mint/coral for resisted-vs-spent); category colour map switched to muted v2 palette; tooltips use new card styling; tabular-num XAxis labels. |
| `ProfilePage.tsx` | Removed "Lv.7" pill and the 10-name RPG level lookup ("Pengeguru" etc.) — just "Nivå 7". User icon → initials avatar. Achievements: kept the same achievement logic but renamed RPG-y names ("Jernvilje" → "Uke uten impuls", "Spareguru" → "Tusen-grensen") and replaced colourful per-icon tints with a single muted-gold treatment when unlocked. Added two new achievements (`month_streak`, `save_10000`) for endgame. |
| `LoginPage.tsx` / `RegisterPage.tsx` | "ImpulseGuard" → "Spendor"; purple primary button → mint (matches global accent for primary positive actions); subhead copy tightened. |

## Files NOT touched
- `src/api/*` (auth, client, coach, dashboard, profile, receipts, resisted, waitingList)
- `src/contexts/AuthContext.tsx`
- `src/main.tsx`
- `package.json`, `vite.config.ts`, `tsconfig*.json`, `postcss.config.js`, `nixpacks.toml`, `railway.json`

## How to apply
Drop the contents of this folder over your existing `frontend/`. Files are at the same paths. No new dependencies needed — everything still uses your existing `lucide-react`, `recharts`, `canvas-confetti`, `tailwindcss`.

After applying:
```
npm install   # only if you reset node_modules
npm run dev
```
