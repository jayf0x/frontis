export interface Showcase {
  id: string;
  title: string;
  category: string;
  component: unknown;
  description?: string;
  tags?: string[];
}

/** Validate and register a showcase. Duplicate id warns + overwrites. */
export function defineShowcase(meta: Showcase): Showcase;

/** Everything registered so far, in registration order. */
export function getShowcases(): Showcase[];

/** Distinct categories, derived for nav. First-seen order. */
export function getCategories(): string[];

/** Reset the registry (test helper). */
export function clearShowcases(): void;
