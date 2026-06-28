/**
 * @frontis/core — framework-agnostic showcase registry (M1).
 *
 * A showcase is registered as a side effect of importing the module that
 * defines it. No filesystem convention, no router, no React. The React layer
 * (M2) reads this registry; consumers can also read it directly.
 */

export interface Showcase {
  /** Stable key, unique across the app. Used for URLs later. */
  id: string;
  /** Human label, e.g. for nav. */
  title: string;
  /** Group the showcase belongs to (derived into categories). */
  category: string;
  /**
   * The live thing. Framework-agnostic on purpose: core never imports React,
   * so this stays `unknown` and the React layer narrows it to a component.
   */
  component: unknown;
  description?: string;
  tags?: string[];
}

const REQUIRED = ['id', 'title', 'category', 'component'] as const;

/** Insertion-ordered, deduped by id. */

/**
 * Validate and register a showcase. Returns the same object for convenience.
 *
 * Duplicate id → warn + overwrite (last-write-wins). This is intentional:
 * Vite re-executes a module on every hot edit, so throwing here would red-screen
 * the dev server every time you touch a showcase file. A genuine id collision
 * still surfaces loudly via the warning.
 * ponytail: last-write-wins keyed by id; if duplicate ids must hard-fail in a
 * build/CI step, add a separate `assertNoDuplicates()` check there, not here.
 */
export function defineShowcase(meta: Showcase): Showcase {
  for (const field of REQUIRED) {
    const v = meta[field];
    if (v == null || v === '') {
      throw new Error(`defineShowcase: "${field}" is required`);
    }
  }
  if (registry.has(meta.id)) {
    console.warn(`defineShowcase: id "${meta.id}" already registered — overwriting.`);
  }
  registry.set(meta.id, meta);
  return meta;
}

/** Everything registered so far, in registration order. */
export function getShowcases(): Showcase[] {
  return [...registry.values()];
}

/** Distinct categories, derived for nav. First-seen order. */
export function getCategories(): string[] {
  return [...new Set(getShowcases().map((s) => s.category))];
}

/** Reset the registry. Exists for tests; not part of the consumer happy path. */
export function clearShowcases(): void {
  registry.clear();
}
