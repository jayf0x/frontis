# Frontis

A tiny library for building **interactive showcases** — not a Storybook replacement, not (yet) an app, not a CLI.

> Storybook says: *here is every state of every component.*
> Frontis says: *here is a cool thing, here is the source, here are some knobs — go play.*

---

## Mental model

Frontis is a **library for building interactive showcases**, developed *inside-out*:

1. Start with a few excellent, composable primitives you can drop into an existing React/Preact project.
2. Validate them in a real project (fluidity-js).
3. Only *then* compose them into an optional showcase application + generator.

The application is a **demonstration** of Frontis — not its foundation. If we get the primitives right, the app and CLI become a thin layer. If we start with the app, every primitive inherits its assumptions.

### What Frontis is not

No addon system. No themes. No MDX. No decorators. No loaders. No globals. No test runner. No interaction testing. No a11y tab. No viewport tab. No actions. No snapshots.

The moment someone needs those: **use Storybook**. Frontis proudly stops at interactive showcases.

### Vocabulary

We don't have *stories*. We have **showcases**.

- Story → **Showcase**
- Story metadata → **Meta**
- Story source → **Source**

A showcase is an *experiment*: title, description, the live thing, controls, and its own source. Closer to an in-repo CodePen than a component catalog.

---

## Packaging strategy

**One package, multiple entry points** — tree-shakeable subpaths, no monorepo. The whole thing is a registry, a couple of hooks/components, and (later) an init script; a Turborepo would be ceremony around ~5 small files. The core/react *boundary* still exists — enforced by the `exports` map and the fact that core never imports React — without the workspace machinery.

```
frontis/
  src/
    index.ts     → frontis          (core: registry, zero React)
    react.tsx    → frontis/react    (Showcase, useSharedControls, Source, Nav)
  vite.config.js  (lib build, two entries)
  package.json    (exports subpaths)
```

```ts
import { defineShowcase, getShowcases } from "frontis";
import { Showcase, Source, Nav, useSharedControls } from "frontis/react";
// Phase 2 would add another subpath, e.g. "frontis/router".
```

`frontis/react` is a separate entry so a non-React consumer importing `frontis` never pulls React; both stay independently tree-shakeable. The real-world validation consumer (fluidity-js) lives in its **own repo** and depends on the published/linked package — this keeps the boundary honest, instead of hiding leaks behind a shared workspace.

If `router`/`cli` ever need genuinely independent release cadences, the split to a monorepo is mechanical and cheap to defer — so it's deferred (YAGNI). Leva is a **peer dependency**, not a re-implementation. Frontis composes Leva; it does not replace it.

---

## Phase 1 — Primitives (the only phase that matters right now)

Pure library. Zero routing. Zero CLI. No assumptions about project structure.

### `frontis/core`

Framework-agnostic showcase definition + registry.

```ts
defineShowcase({
  id: "lightning",            // stable key, used for URLs later
  title: "Lightning",
  category: "Effects",
  description?: string,
  tags?: string[],
  component: Lightning,
}): Showcase

getShowcases(): Showcase[]    // everything registered so far
getCategories(): string[]     // derived, for nav
```

Registration is an explicit side effect of importing the module — no filesystem convention required, no router required. A consumer collects showcases however they like:

```ts
import "./Showcases/Lightning";   // each file calls defineShowcase
import "./Showcases/Aurora";
```

(Filesystem auto-registration via `import.meta.glob` is a *convenience* the consumer can opt into — it is not part of core.)

### `frontis/react`

The thin React/Preact layer that renders the primitives.

- **`<Showcase>`** — frames one showcase. Owns an **isolated Leva store** (so tabs don't share control state), renders the control panel, renders the live component. Replaces the hand-rolled `useCreateStore()` + wrapper ceremony.
- **`useSharedControls(sharedSchema, overrides?)`** — the validated nugget. Composes a shared base control schema with per-showcase overrides on the current showcase's isolated store, and returns flat values. This is the generalization of fluidity's `useFluidControls` — *minus* anything fluidity-specific.
- **`<Source>`** — displays a showcase's own source with a copy button. Default: the whole file (raw import). Cropping (`from`/`to`/`id`) is deferred until someone actually needs it.
- **`<Nav>`** — tab navigation driven by the registry's categories. Replaces hand-maintained tab arrays + example maps.

That's it for Phase 1. No `<Documentation>`, no `<Controls>` of our own, no x-arrows.

#### Shared-controls principle

90% of controls are shared across showcases; only a few are showcase-specific. So the model is **shared schema + local overrides**, merged by object spread on one isolated store:

```tsx
function Lightning() {
  // shared base (defined once, reused everywhere)
  const shared = useSharedControls(fluidSchema);
  // local, showcase-specific knobs
  const local = useControls({ branches: { value: 18, min: 1, max: 64 } });
  return <FluidText {...shared} {...local} />;
}
```

The "merge" is spread. There is no merge engine to build.

---

## Phase 2 — Routing & sharing (optional layer)

Routing is a **convenience over showcase registration**, not a core dependency. This is why Frontis does not commit to Wouter (or any router) early.

`frontis/router`:

- Hash routing (deploy anywhere, zero server config) and browser routing.
- **URL-synced controls** — the genuine killer feature. `lightning?branches=18&speed=7&blur=0.4` round-trips Leva values to query params, so any showcase state is a shareable link.
- Search (`/` to focus).
- Navigation components wired to the registry.

Hotkeys worth stealing from VitePress: `S` source, `C` controls, `F` fullscreen, `R` reset, `/` search.

---

## Phase 3 — Generator (last, thinnest layer)

`frontis/cli` — `bunx frontis init` scaffolds an opinionated app that consumes the *same public APIs*:

```
src/
  App.tsx
  Showcases/
  Components/
  Hooks/
  Assets/
  styles.css
```

Plus static export and deploy helpers.

**Hard rule:** the CLI must never contain functionality not already available through the public packages. If `init` needs it, it belongs in core/react/router first. The simplest viable form of `init` is `degit` over a template repo — build the bespoke CLI only if the template approach proves insufficient.

---

## Stack

- **Preact** — React-compatible, lightweight, mature.
- **Leva** — controls engine (peer dep), not rebuilt.
- **Vite** — dev server + build; let it own bundling (esbuild/Rolldown).
- **TypeScript** — strict by default.
- Router: deferred to Phase 2. Million: skipped.

---

## Philosophy

Build from the inside out. Excellent primitives first, validated in a real project, then composed into an optional application. Every feature must answer one question:

> Does this make building or sharing a great interactive demo easier?

If the answer isn't an immediate *yes*, it belongs in Storybook, not Frontis.

Keep the core on the order of a few thousand lines, not tens of thousands. Architectural mistakes are cheap to fix while the surface is a library and expensive once a CLI and project structure become public API — so the CLI comes last, on purpose.
