import React from 'react';
import { PageProgression } from '@/client/components/PageProgression';
import { create } from 'react-test-renderer';

describe('PageProgression component', () => {
  describe('when no active page is set', () => {
    it('shows the first step as the active step', () => {
      const rendered = create(<PageProgression />);
      expect(rendered.toJSON()).toMatchSnapshot();
    });
  });
});
