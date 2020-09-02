import React, { useContext } from 'react';
import { ConsentsLayout } from '../layouts/ConsentsLayout';
import { css } from '@emotion/core';
import { brand, space } from '@guardian/src-foundations';
import { titlepiece, textSans } from '@guardian/src-foundations/typography';
import { gridItem, gridItemColumnConsents, getAutoRow } from '../styles/Grid';
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

const getNewsletterCardCss = (index: number) => {
  const ITEMS_PER_ROW = 2;
  const OFFSET = 4;
  const row = Math.trunc(index / ITEMS_PER_ROW) + OFFSET;
  const column = index % ITEMS_PER_ROW;

  const gridDef = {
    TABLET: { start: 2 + column * 5, span: 5 },
    DESKTOP: { start: 2 + column * 5, span: 5 },
    WIDE: { start: 3 + column * 6, span: 6 },
  };

  return css`{
    ${gridItem(gridDef)}
    -ms-grid-row: ${row};
  }`;
};

export const NewslettersPage = () => {
  const globalState = useContext<GlobalState>(GlobalStateContext);
  const newsletters = globalState?.pageData?.newsletters ?? [];
  const autoRow = getAutoRow(1, gridItemColumnConsents);
  return (
    <ConsentsLayout title="Newsletters" current={CONSENTS_PAGES.NEWSLETTERS}>
      <h3 css={[h3, autoRow()]}>Free newsletters from The Guardian</h3>
      <p css={[p, autoRow()]}>
        Our newsletters help you get closer to our quality, independent
        journalism.
      </p>
      {newsletters.map((newsletter, i) => (
        <NewsletterCard
          title={newsletter.name}
          description={newsletter.description}
          frequency={newsletter.frequency}
          key={newsletter.id}
          cssOverides={getNewsletterCardCss(i)}
        />
      ))}
    </ConsentsLayout>
  );
};
