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
  describe('when an active section is supplied', () => {
    it('marks the previous sections as done and the current one as active', () => {
      const rendered = create(<PageProgression current={'Newsletters'} />);
      expect(rendered.toJSON()).toMatchSnapshot();
    });
  });
  describe('when on the last section', () => {
    it('marks the previous sections as done and the last one as active', () => {
      const rendered = create(<PageProgression current={'Review'} />);
      expect(rendered.toJSON()).toMatchSnapshot();
    });
  });
});
