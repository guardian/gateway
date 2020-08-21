import React from 'react';
import { PageProgression } from '@/client/components/PageProgression';
import { create } from 'react-test-renderer';
import {
  CONSENTS_PAGES_ARR,
  CONSENTS_PAGES,
} from '@/client/models/ConsentsPages';

describe('PageProgression component', () => {
  describe('when no active page is set', () => {
    it('shows the first step as the active step', () => {
      const rendered = create(<PageProgression pages={CONSENTS_PAGES_ARR} />);
      expect(rendered.toJSON()).toMatchSnapshot();
    });
  });
  describe('when an active section is supplied', () => {
    it('marks the previous sections as done and the current one as active', () => {
      const rendered = create(
        <PageProgression
          pages={CONSENTS_PAGES_ARR}
          current={CONSENTS_PAGES.NEWSLETTERS}
        />,
      );
      expect(rendered.toJSON()).toMatchSnapshot();
    });
  });
  describe('when on the last section', () => {
    it('marks the previous sections as done and the last one as active', () => {
      const rendered = create(
        <PageProgression
          pages={CONSENTS_PAGES_ARR}
          current={CONSENTS_PAGES.REVIEW}
        />,
      );
      expect(rendered.toJSON()).toMatchSnapshot();
    });
  });
});
