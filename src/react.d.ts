import type { ReactNode } from 'react';
import type { Schema, SchemaToValues, StoreType } from 'leva/dist/declarations/src/types';

/**
 * Frames one showcase with an isolated Leva store + control panel.
 * Return is intentionally untyped (`any`) so these public types don't pin a
 * specific `@types/react` version — avoids React 18/19 JSX element-type clashes
 * in consumers that are on a different React than Frontis was built against.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Showcase(props: { children?: ReactNode }): any;

/** The current `<Showcase>`'s isolated Leva store. */
export function useShowcaseStore(): StoreType;

export interface SharedControlsOptions<S extends Schema> {
  folder?: string;
  overrides?: Partial<S>;
}

/** Shared schema + per-showcase overrides on the showcase store → flat values. */
export function useSharedControls<S extends Schema>(
  sharedSchema: S,
  options?: SharedControlsOptions<S>,
): SchemaToValues<S>;
