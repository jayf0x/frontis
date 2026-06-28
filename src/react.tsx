/**
 * @frontis/react — the thin React/Preact layer (M2).
 *
 * Exposed as the `frontis/react` entry point. Core (`frontis`) stays
 * React-free; everything that touches React or Leva lives here.
 *
 * Leva is a peer dependency: Frontis composes it, never re-implements it.
 */

import type { PropsWithChildren } from 'react';

import { LevaPanel, LevaStoreProvider, useControls, useCreateStore, useStoreContext } from 'leva';
import type { Schema, SchemaToValues } from 'leva/dist/declarations/src/types';

const FILL = { width: '100%', height: '100%', position: 'relative' } as const;

/**
 * Frames one showcase. Owns an isolated Leva store so sibling showcases never
 * share control state, renders the control panel, and provides the store via
 * Leva's own context — so any `useControls` (ours or the consumer's local
 * `useControls('settings', …)`) inside resolves this store automatically, with
 * no store prop to thread. Replaces fluidity's `DemoWrapper` + `useCreateStore`.
 */
export function Showcase({ children }: PropsWithChildren) {
  const store = useCreateStore();
  return (
    <LevaStoreProvider store={store}>
      <div style={FILL}>
        <LevaPanel store={store} />
        {children}
      </div>
    </LevaStoreProvider>
  );
}

/**
 * The current `<Showcase>`'s isolated Leva store — for when a consumer needs
 * the store object directly (a custom panel, imperative `set`/`get`).
 * Most consumers won't: `useControls` picks up the store from context on its own.
 */
export const useShowcaseStore = useStoreContext;

export interface SharedControlsOptions<S extends Schema> {
  /** Group the controls under a Leva folder, e.g. "fluid config". */
  folder?: string;
  /** Per-showcase knobs merged over the shared schema (last write wins). */
  overrides?: Partial<S>;
}

/**
 * Compose a shared base control schema with per-showcase overrides on the
 * enclosing `<Showcase>`'s isolated store, returning flat values ready to
 * spread onto a component. The generalization of fluidity's `useFluidControls`
 * — minus anything fluid-specific (no `DEFAULT_CONFIG`, no `updateConfig` sync;
 * those stay in the consumer).
 *
 * The "merge" is object spread. There is no merge engine.
 */
export function useSharedControls<S extends Schema>(
  sharedSchema: S,
  options: SharedControlsOptions<S> = {},
): SchemaToValues<S> {
  const { folder, overrides } = options;
  // Store resolves from <Showcase> via Leva's context — no store prop needed.
  // ponytail: schema object is rebuilt each render; negligible for a control
  // panel. If a showcase ever carries a huge schema, pass a memoized object.
  const schema = { ...sharedSchema, ...overrides };
  const run = useControls as (a: unknown, b?: unknown) => SchemaToValues<S>;
  return run(folder ?? schema, folder ? schema : undefined);
}
