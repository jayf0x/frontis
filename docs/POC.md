# Frontis POC

**Goal:** prove the Phase 1 primitives by replacing hand-rolled plumbing in the `fluidity-js` demo with Frontis, using the demo as the real-world QA harness.

**Done when:** the fluidity demo runs on Frontis primitives with identical behavior, and the hand-maintained registry/store/source ceremony is gone.

Scope: the `frontis` (core) + `frontis/react` entry points only. No router. No CLI. Leva is a peer dep.

**Repo shape:** a single package with two entry points — `frontis` (core) and `frontis/react` — via the `exports` map. No monorepo: the surface is ~5 small files, so a Turborepo would be ceremony. The core/react boundary is enforced by `exports` + core never importing React. fluidity-js is **not** in this repo; it stays in its own repo and consumes the built package via `file:`/`link` during dev, so the package boundary is exercised for real (watch React dedupe when linking).

## Why fluidity-js is the test case

The fluidity demo (`/Users/me/Documents/GitHub/fluidity/demo/src`) **already contains the hand-rolled primitive version of everything Frontis will own**:

- `App.tsx` `EXAMPLE_MAP` = a manual registry.
- `TabNav.tsx` `TABS` = manual nav data.
- `useCreateStore()` + `DemoWrapper` = manual per-showcase store isolation.
- `useFluidControls.ts` = the shared/local control composition we're generalizing.

So the POC isn't a toy demo we invent — it's extracting a pattern that already exists and proved useful in a real project, then feeding it back in. If Frontis can replace that plumbing with no behavior change, the primitives are validated.

---

## What we're replacing (current fluidity demo)

Real code in `fluidity/demo/src` that Frontis should absorb:

| Demo code today | Frontis primitive | Notes |
|---|---|---|
| `App.tsx` `EXAMPLE_MAP` + `TABS` in `TabNav.tsx` | `defineShowcase` + `getShowcases()` + `<Nav>` | kill the hand-maintained map/array |
| `useCreateStore()` + `<DemoWrapper store>` per example | `<Showcase>` | one isolated Leva store per showcase, panel included |
| `useFluidControls.ts` (shared/local merge) | `useSharedControls` + fluidity-owned schema | generic composition moves to Frontis; the fluid schema + `updateConfig` sync stays in fluidity |
| (none — new capability) | `<Source>` | raw file view + copy; added to one example as QA |

**Stays in fluidity, never enters Frontis:** `DEFAULT_CONFIG`, `FluidHandle`, `updateConfig`, the fluid control schema. The moment Frontis knows what a fluid is, it stops being a showcase generator.

---

## Milestones

### M0 — Single-package skeleton ✅
- [x] One package, `type: module`, strict `tsconfig`. Vite lib build, two entries (`src/index.ts` → `frontis`, `src/react.tsx` → `frontis/react`), ESM + hand-authored `.d.ts` copied into `dist`.
- [x] `exports` map exposes `.` (core, no runtime deps) and `./react`. Peer deps: `react`/`react-dom` (required), `leva` (optional — only `frontis/react` needs it).
- [x] **Check:** `bun run typecheck` + `bun run build` green; built `dist/react.js` keeps `react`/`react/jsx-runtime`/`leva` external.

### M1 — `frontis/core`: registry ✅
- [x] `defineShowcase(meta)` — validates required fields (`id`, `title`, `category`, `component`), registers into a module-level registry keyed by `id`, returns the showcase.
- [x] `getShowcases()` / `getCategories()` (deduped, first-seen order). Plus `clearShowcases()` test helper.
- [x] **Check:** test asserts missing required field throws, duplicate `id` **warns + overwrites** (HMR-safe — throwing would red-screen Vite on every showcase edit), and `getCategories()` dedupes.

### M2 — `frontis/react`: `<Showcase>` + `useSharedControls` ✅
- [x] `<Showcase>` creates one isolated Leva store (`useCreateStore`), provides it via Leva's own `LevaStoreProvider` context, renders `<LevaPanel store>` + children. So a consumer's local `useControls('settings', …)` resolves this store automatically — no store prop to thread.
- [x] `useSharedControls(sharedSchema, options?)` — `options` = `{ folder?, overrides? }`. Merges `{ ...sharedSchema, ...overrides }` on the context store, returns flat values. `folder` preserves fluidity's `'fluid config'` grouping. No sync effect inside (consumer-specific). Plus `useShowcaseStore()` for direct store access.
- [x] **Check:** two `<Showcase>` instances get distinct stores; `useSharedControls` returns the right flat values through context.

### M3 — Port the fluidity demo onto M1–M2
- [ ] Add `defineShowcase(...)` to each file in `demo/src/examples/` (Text, Image, AutoSplat, Split).
- [ ] Replace `App.tsx` `EXAMPLE_MAP` + `EXAMPLE` switch with `getShowcases()` → render selected.
- [ ] Replace `TabNav` data source with `getCategories()`/`getShowcases()` (keep the existing visual TabNav, just feed it from the registry).
- [ ] Wrap each example body in `<Showcase>`; delete `DemoWrapper` + per-example `useCreateStore`.
- [ ] Refactor `useFluidControls` to call `useSharedControls(fluidSchema)`; keep the `updateConfig` sync `useEffect` in fluidity.
- [ ] **QA:** every tab renders, controls are isolated per tab, fluid sim responds to control changes exactly as before. Visual + FPS parity with `main`.

### M4 — `<Source>`
- [ ] `<Source of={...} />` shows a showcase's own file via Vite `?raw` import; copy-to-clipboard button.
- [ ] Wire it into one example (TextExample) as the QA case.
- [ ] **QA:** displayed source matches the file on disk; copy works.

---

## Exit criteria / sign-off

- [ ] fluidity demo runs entirely on Frontis primitives.
- [ ] Deleted from demo: `EXAMPLE_MAP`, hand-maintained `TABS` data, `DemoWrapper`, per-example `useCreateStore` boilerplate.
- [ ] No fluidity-specific types leaked into `frontis/*`.
- [ ] Behavior parity with `main` (render, control isolation, sim response, FPS).
- [ ] Frontis core ≪ a few hundred LOC; both entry points tree-shakeable.

## Explicitly out of scope for POC

Router, URL-synced controls, hash routing, search, hotkeys, `<Documentation>`, a frontis-owned `<Controls>`/`useControls`, `frontis init`, templates, static export, the `frontis/router` and `frontis/cli` entry points. All deferred to Phase 2/3 — add only when a second real consumer needs them (a new subpath is a one-line `exports` addition, not a packaging project).
