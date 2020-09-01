import React, { useContext } from 'react';
import { ConsentsLayout } from '../layouts/ConsentsLayout';
import { css } from '@emotion/core';
import { brand, space } from '@guardian/src-foundations';
import { titlepiece, textSans } from '@guardian/src-foundations/typography';
import { gridItem, gridItemColumnConsents } from '../styles/Grid';
import { GlobalStateContext } from '../components/GlobalState';
import { CONSENTS_PAGES } from '../models/ConsentsPages';
import { GlobalState } from '@/shared/model/GlobalState';
import { NewsletterCard } from '../components/NewsletterCard';

const h3 = css`
  color: ${brand[400]};
  margin: ${space[12]}px 0 ${space[3]}px 0;
  ${titlepiece.small()};
  ${gridItem(gridItemColumnConsents)}
  // Overrides
  font-size: 17px;
`;

const p = css`
  margin: 0;
  ${textSans.medium()}
  ${gridItem(gridItemColumnConsents)}
`;

const newsletterGridDef = {
  TABLET: { start: 2, span: 10 },
  DESKTOP: { start: 2, span: 10 },
  WIDE: { start: 2, span: 16 },
};

const newslettercard = css`
  ${gridItem(newsletterGridDef)}
`;

export const NewslettersPage = () => {
  const globalState = useContext<GlobalState>(GlobalStateContext);
  const newsletters = globalState?.pageData?.newsletters ?? [];
  return (
    <ConsentsLayout title="Newsletters" current={CONSENTS_PAGES.NEWSLETTERS}>
      <h3 css={h3}>Free newsletters from The Guardian</h3>
      <p css={p}>
        Our newsletters help you get closer to our quality, independent
        journalism.
      </p>
      {newsletters.map((newsletter) => (
        <NewsletterCard
          title={newsletter.name}
          description={newsletter.description}
          frequency={newsletter.frequency}
          key={newsletter.id}
          cssOverides={newslettercard}
        />
      ))}
    </ConsentsLayout>
  );
};
