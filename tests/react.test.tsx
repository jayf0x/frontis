// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { levaStore } from 'leva';
import { describe, expect, it } from 'vitest';

import { Showcase, Source, useSharedControls, useShowcaseStore } from '../src/react';

describe('Showcase', () => {
  it('gives each instance an isolated Leva store', () => {
    const stores: unknown[] = [];
    function Probe() {
      stores.push(useShowcaseStore());
      return null;
    }
    render(
      <>
        <Showcase>
          <Probe />
        </Showcase>
        <Showcase>
          <Probe />
        </Showcase>
      </>,
    );
    expect(new Set(stores).size).toBe(2);
  });
});

describe('useSharedControls', () => {
  it('returns flat values resolved from the showcase store', () => {
    let values: Record<string, unknown> | undefined;
    function Probe() {
      values = useSharedControls({ x: { value: 5, min: 0, max: 10 } });
      return null;
    }
    render(
      <Showcase>
        <Probe />
      </Showcase>,
    );
    expect(values).toEqual({ x: 5 });
  });

  it('keeps controls off the global store and isolated per showcase', () => {
    // Same key, different default per showcase. If both landed on Leva's global
    // store (the bug), the second would inherit the first's value by path.
    const seen: number[] = [];
    function Probe({ v }: { v: number }) {
      const { shared } = useSharedControls({ shared: { value: v, min: 0, max: 100 } }) as {
        shared: number;
      };
      seen.push(shared);
      return null;
    }
    render(
      <>
        <Showcase>
          <Probe v={1} />
        </Showcase>
        <Showcase>
          <Probe v={2} />
        </Showcase>
      </>,
    );
    // Each showcase keeps its own default — not collapsed to a shared value.
    expect(seen).toEqual([1, 2]);
    // And nothing leaked onto the global store.
    expect(Object.keys(levaStore.getData())).not.toContain('shared');
  });
});

describe('Source', () => {
  it('renders the given code', () => {
    const { container } = render(<Source code="const a = 1;" />);
    expect(container.querySelector('code')?.textContent).toBe('const a = 1;');
    expect(container.querySelector('button')?.textContent).toMatch(/copy/i);
  });
});
