import { afterEach, describe, expect, it, vi } from 'vitest';

import { clearShowcases, defineShowcase, getCategories, getShowcases } from '../src/index';

const showcase = (id: string, category = 'Effects') => ({
  id,
  title: id,
  category,
  component: () => null,
});

afterEach(() => clearShowcases());

describe('defineShowcase', () => {
  it('registers and returns the showcase', () => {
    const s = defineShowcase(showcase('lightning'));
    expect(s.id).toBe('lightning');
    expect(getShowcases()).toHaveLength(1);
  });

  it('throws when a required field is missing', () => {
    // @ts-expect-error — intentionally missing `component`
    expect(() => defineShowcase({ id: 'x', title: 'x', category: 'c' })).toThrow(/component/);
    expect(() => defineShowcase(showcase(''))).toThrow(/id/);
  });

  it('warns and overwrites on duplicate id (HMR-safe, no throw)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    defineShowcase(showcase('dup', 'A'));
    defineShowcase({ ...showcase('dup', 'B'), title: 'second' });
    expect(warn).toHaveBeenCalledOnce();
    const all = getShowcases();
    expect(all).toHaveLength(1);
    expect(all[0].title).toBe('second'); // last write wins
    warn.mockRestore();
  });
});

describe('getCategories', () => {
  it('dedupes and preserves first-seen order', () => {
    defineShowcase(showcase('a', 'Effects'));
    defineShowcase(showcase('b', 'Backgrounds'));
    defineShowcase(showcase('c', 'Effects'));
    expect(getCategories()).toEqual(['Effects', 'Backgrounds']);
  });
});
