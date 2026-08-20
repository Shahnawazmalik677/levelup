# LevelUp

Pick a hobby, tell it how deep you want to go, and AI builds you a focused list of
5-8 techniques for that level — not "master everything," just enough to actually
get good and know whether you like it. Track each technique to completion, skip
the ones that don't interest you, swap out ones you don't like, and watch your
skill tree fill in.

Built for the brief: *"I don't want to go on YouTube and spend endless time
searching for the right videos... a good mix of videos and reading content for
just 5-8 techniques should be good enough."*

## Why this shape, not something else

The common failure mode with hobby-learning apps is treating every hobby the
same way — MCQ quizzes for chess, audio lessons for chess, reading-only content
for guitar. None of that matches how people actually learn a physical or
tactical skill. So the core loop stays deliberately narrow:

1. **Pick a hobby + a level of ambition** ("just curious" vs. "want to get
   good") — the level changes how deep the AI-generated techniques go, not just
   how many there are.
2. **Get a short, sequenced list of techniques**, each with a plain-language
   description, *why it matters*, a practice checklist, and real YouTube videos
   pulled live per technique (not hardcoded links).
3. **Work through them one at a time** — techniques unlock in order as you
   complete or skip the one before, so it always reads as a path, not a todo
   dump.
4. **Level up or move on** — finish every technique in a level and you're
   offered the next level for that same hobby, or, if you just finished the
   top level, the app remembers you mastered it.

No signup, no login screen — the whole thing runs on-device against
`AsyncStorage`. An account system wasn't a value-add for "help me learn chess
faster," so it was cut in favor of spending that time on the actual learning
loop.

## Architecture

npm-workspaces monorepo:

```
apps/
  mobile/   Expo (React Native) + expo-router
  server/   Express API, talks to Gemini + YouTube
```

**`apps/mobile`** — `app/` is routing only; every route file is a one-line
re-export (`export { default } from '../features/XScreen'`), and the real
screen logic lives in `features/<ScreenName>/`. Shared UI (`components/`),
data hooks (`hooks/`), and the AsyncStorage layer (`store/storage.ts`) sit at
the top level rather than being nested per-feature, since things like
`HobbyCard` or the learning-plan hook are used by three or four screens each —
forcing them into one feature's folder would just be an arbitrary ownership
call with no benefit.

**`apps/server`** — thin Express layer over two external calls: Gemini
generates/regenerates technique plans, the YouTube Data API supplies videos
per technique. No database — the server is stateless; all persistence is
client-side.

### Why not Redux / a heavier state layer

State here is exactly two shapes — `learningPlans[]` and `streakData` — both
already isolated in their own hook (`useLearningPlans`, `useStreak`), each
backed 1:1 by an AsyncStorage key. None of the async-orchestration complexity
that something like Redux-Observable exists to solve (racing, cancelling,
retrying concurrent requests) shows up anywhere in this app. Reaching for that
here would be solving a problem the app doesn't have.

### Data model: multiple hobbies, tracked concurrently

Storage evolved from a single `learning_plan` record to a `learning_plans[]`
array (capped at 4 concurrent hobbies) after realizing the obvious real-world
case — someone learning guitar *and* chess at once — had no path in a
single-plan model beyond replacing one with the other. Plans are keyed by
hobby name: picking an untracked hobby adds a new concurrent plan; picking one
you're already tracking replaces just that slot (with a confirmation, since
that's destructive).

Three storage keys exist specifically to survive plan replacement/removal,
because losing them silently would repeat the same mistake in different
forms:
- **`level_history`** — every level you've actually *finished* (not abandoned
  — a plan only gets archived here if every technique in it reached
  `completed`/`skipped`), snapshotted right before it would otherwise be
  overwritten or removed.
- **`mastered_hobbies`** — a permanent badge the moment you finish a hobby's
  top level. Doesn't get cleared even if you later drop that hobby.
- **`streak_data`** (streak/XP/lifetime completed-count) — cumulative across
  every hobby you've ever touched. Dropping one of several concurrent hobbies
  doesn't zero out progress earned on the others.

## AI integration

`POST /api/learning-plan` and `POST /api/swap-technique` both call Gemini with
a structured-JSON response schema, so the model returns a typed plan
(technique name, description, why-it-matters, difficulty, practice checklist)
rather than freeform text that needs fragile parsing.

**Model choice, and why it changed twice:** started on `gemini-2.5-flash`,
which the API key's account had already deprecated access to. Moved to
`gemini-3.6-flash` — technically worked, but it's a "thinking" model, so every
plan generation took ~25s and threw frequent `503`s under any load, which is a
bad experience for something a user expects to feel instant. Settled on
**`gemini-3.5-flash-lite`** — no thinking-token overhead, ~3-5s responses,
verified stable across repeated calls, and still free-tier. For a
request/response JSON generation task like this (not multi-step reasoning),
the lite tier's speed mattered far more than the larger model's depth.

## Testing

`apps/mobile/store/__tests__/storage.test.ts` covers the storage layer's
actual business logic — the parts with real edge cases, not boilerplate:

- `isPlanComplete` — a level counts as finished if every technique is
  completed *or skipped*, not just completed.
- `upsertLearningPlan` — adding an untracked hobby vs. replacing an existing
  one by (case-insensitive) hobby name, and that replacement only archives to
  Level History when the old plan was actually finished.
- The sequential unlock in `updateTechnique` (completing or skipping a
  technique activates the next locked one).
- `removeLearningPlan` only touches the targeted hobby, leaving other
  concurrent plans untouched.
- `getLevelHistory` filters out any legacy entries that predate the
  completion requirement, so it's self-healing against already-stored data
  rather than needing a migration.

Run with `cd apps/mobile && npm test`.

This isn't exhaustive component/UI test coverage — given the time budget, it's
targeted at the logic most likely to silently break (storage mutation and
archiving rules), not the parts that would visibly break on first tap.

## Design

One neutral surface + one accent (brass gold), in both a dark and a light
variant — no per-hobby or per-status color-coding. Category identity comes
from icon + label, technique status from ring *form*
(locked/active/completed/skipped), difficulty from neutral badges — never
from a second hue. Fraunces for headings, Public Sans for body/UI, JetBrains
Mono for anything tabular (streaks, percentages, XP counts).

The palette is picked from the device's system appearance setting
(`Appearance.getColorScheme()`) once at launch — the light and dark palettes
share the same accent hue at different lightness levels chosen for contrast
in each context, rather than two unrelated color schemes. It's read once at
startup rather than re-rendered live if the system theme changes mid-session,
which was the deliberate tradeoff given the time available.

Design direction took inspiration from **Habitify**, **Streaks**, and
**Onrise** for the restrained, single-accent habit-tracking language, and from
**wondering.app** for how a structured "path" can read as calm rather than
like a checklist. No visual assets or copy were copied — just the general
instinct toward minimalism over gamified noise.

## Bundle size

`react-native-vector-icons` was installed but never imported anywhere — the
app uses `@expo/vector-icons` exclusively — so it was removed, dropping 12
transitive packages from the dependency tree.

## How AI was used

Claude Code was the primary coding tool for this project. The product and
architecture calls were mine, made through direct back-and-forth rather than
accepting whatever came out first — deciding against Redux for the reasons
above, choosing the `features/`-folder convention over nesting everything
under `app/`, designing the multi-hobby data model (and specifically its
4-concurrent-hobby cap and hobby-name-keyed replace/add logic) after
identifying that a single-active-plan model couldn't represent someone
learning two hobbies at once, choosing which Gemini model to run after
seeing the first two options fail on latency/availability in practice, and
deciding what was and wasn't worth testing given the time budget. Claude
wrote the implementation against those decisions, and any given file's
reasoning should be something I can walk through, not just something that
exists.

## Running locally

Requires two processes:

```bash
# 1. Server
cd apps/server
cp .env.example .env   # fill in GEMINI_API_KEY, YOUTUBE_API_KEY
npm install
npm run dev

# 2. Mobile (separate terminal, from apps/mobile — not the repo root)
cd apps/mobile
npm install
npx expo start
```

Scan the QR with Expo Go. The app resolves the API host from Metro's own dev
server address, so it works on a physical device on the same network without
any manual IP configuration — this only works while Metro is running, though
(see below for the built APK).

## Deployment

- **Server**: deployed on Render (`render.yaml` at the repo root). Render's
  free tier spins the server down after ~15 minutes idle, costing the next
  request 30-50s to wake it — mitigated two ways: a GitHub Actions workflow
  (`.github/workflows/keep-server-warm.yml`) pings the health endpoint every
  10 minutes so it never actually goes idle, and the app itself fires a
  fire-and-forget health check the moment it boots (`IntroScreen`), so even
  a cold instance gets a head start waking up during the intro animation's
  own dead time rather than during someone's first real request.
- **Mobile**: built as a standalone APK via `eas build --platform android
  --profile preview` (`apps/mobile/eas.json`), with `EXPO_PUBLIC_API_URL`
  baked in at build time so the installed app talks to the deployed server
  directly — no dev server or LAN required.

## Known limitations

- The detailed technique-by-technique breakdown and "{hobby} Journey" progress
  bar are scoped to whichever hobby is currently selected in the switcher —
  showing every hobby's full breakdown at once wasn't worth the clutter.
  Level History and Mastered Hobbies, by contrast, are both genuinely
  cross-hobby ledgers, always showing your full record regardless of
  selection.
- Test coverage is intentionally narrow (see Testing) rather than exhaustive,
  given the assignment's time budget.
