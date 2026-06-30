import type { CSSProperties, ReactNode } from 'react';
import type { Schema, SchemaToValues } from 'leva/dist/declarations/src/types';

/**
 * Frames one showcase with an isolated Leva store + control panel.
 * Return is intentionally untyped (`any`) so these public types don't pin a
 * specific `@types/react` version — avoids React 18/19 JSX element-type clashes
 * in consumers that are on a different React than Frontis was built against.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Showcase(props: { children?: ReactNode }): any;

/**
 * The current `<Showcase>`'s isolated Leva store, ready to pass to `useControls`
 * as `{ store }`. Typed `any` on purpose: a `file:`-linked Frontis resolves its
 * own Leva (and zustand) copy, so a pinned `StoreType` would be a different type
 * identity than the consumer's Leva — `any` lets it flow straight back into the
 * consumer's `useControls`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useShowcaseStore(): any;

export interface SharedControlsOptions<S extends Schema> {
  folder?: string;
  overrides?: Partial<S>;
}

/** Shared schema + per-showcase overrides on the showcase store → flat values. */
export function useSharedControls<S extends Schema>(
  sharedSchema: S,
  options?: SharedControlsOptions<S>,
): SchemaToValues<S>;

/** Displays a raw source string with a copy button (consumer passes the string). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Source(props: { code: string; style?: CSSProperties }): any;
