// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Showcase, useSharedControls, useShowcaseStore } from '../src/react';

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
    // Two distinct stores → control state can't leak between showcases.
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
});
