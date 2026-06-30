/**
 * @frontis/react — the thin React/Preact layer.
 *
 * Exposed as the `frontis/react` entry point. Core (`frontis`) stays
 * React-free; everything that touches React or Leva lives here.
 *
 * Leva is a peer dependency: Frontis composes it, never re-implements it.
 *
 * Store model: Leva's `useControls` resolves its store as `settings.store ||
 * levaStore` (the global singleton) — it does NOT read React context. So
 * `<Showcase>` provides its isolated store via context for retrieval, and every
 * `useControls` that should be isolated must be handed that store explicitly:
 * `useSharedControls` injects it; a consumer's own `useControls` passes
 * `{ store: useShowcaseStore() }`.
 */

import type { CSSProperties, PropsWithChildren } from 'react';
import { useState } from 'react';

import { LevaPanel, LevaStoreProvider, useControls, useCreateStore, useStoreContext } from 'leva';
import type { Schema, SchemaToValues } from 'leva/dist/declarations/src/types';

const FILL = { width: '100%', height: '100%', position: 'relative' } as const;

/**
 * Frames one showcase. Owns an isolated Leva store so sibling showcases never
 * share control state, renders the control panel, and exposes the store via
 * context (read it with `useShowcaseStore`). Replaces fluidity's `DemoWrapper`
 * + `useCreateStore`.
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
 * The current `<Showcase>`'s isolated Leva store. Pass it to any `useControls`
 * call inside the showcase to keep that control on this store rather than
 * Leva's global one: `useControls('settings', schema, { store: useShowcaseStore() })`.
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
  const store = useStoreContext();
  // ponytail: schema object is rebuilt each render; negligible for a control
  // panel. If a showcase ever carries a huge schema, pass a memoized object.
  const schema = { ...sharedSchema, ...overrides };
  const run = useControls as (...a: unknown[]) => SchemaToValues<S>;
  // Explicit store — Leva's useControls ignores context (see file header).
  return run(...(folder ? [folder, schema, { store }] : [schema, { store }]));
}

const SOURCE_STYLE: CSSProperties = {
  position: 'absolute',
  bottom: 12,
  right: 12,
  maxWidth: 'min(46ch, 40vw)',
  maxHeight: '40vh',
  overflow: 'auto',
  margin: 0,
  padding: '12px 14px',
  background: 'rgba(10,10,14,0.88)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  color: 'rgba(220,228,245,0.92)',
  fontFamily: 'ui-monospace, "SF Mono", monospace',
  fontSize: 11,
  lineHeight: 1.5,
  zIndex: 30,
};

const COPY_STYLE: CSSProperties = {
  position: 'sticky',
  top: 0,
  float: 'right',
  padding: '2px 10px',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 99,
  background: 'rgba(91,143,249,0.16)',
  color: 'inherit',
  font: 'inherit',
  cursor: 'pointer',
};

/**
 * Shows a showcase's own source with a copy button. The raw string is passed in
 * by the consumer (e.g. a Vite `?raw` import) — Frontis can't resolve a
 * consumer-relative file path itself, so it stays a dumb presentational view.
 */
export function Source({ code, style }: { code: string; style?: CSSProperties }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <pre style={{ ...SOURCE_STYLE, ...style }}>
      <button type="button" onClick={copy} style={COPY_STYLE}>
        {copied ? 'copied ✓' : 'copy'}
      </button>
      <code>{code}</code>
    </pre>
  );
}
