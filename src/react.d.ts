import type { ReactElement, ReactNode } from 'react';
import type { Schema, SchemaToValues, StoreType } from 'leva/dist/declarations/src/types';

/** Frames one showcase with an isolated Leva store + control panel. */
export function Showcase(props: { children?: ReactNode }): ReactElement;

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
