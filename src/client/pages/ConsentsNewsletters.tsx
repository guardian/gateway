import React, { useContext } from 'react';
import { ConsentsLayout } from '@/client/layouts/ConsentsLayout';
import { css } from '@emotion/core';
import { space } from '@guardian/src-foundations';
import {
  gridItem,
  gridItemColumnConsents,
  getAutoRow,
} from '@/client/styles/Grid';
import { GlobalStateContext } from '@/client/components/GlobalState';
import { CONSENTS_PAGES } from '@/client/models/ConsentsPages';
import { GlobalState } from '@/shared/model/GlobalState';
import { NewsletterCard } from '@/client/components/NewsletterCard';
import { from } from '@guardian/src-foundations/mq';
import { heading, text } from '@/client/styles/Consents';

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

  return css`
    ${gridItem(gridDef)}
    -ms-grid-row: ${row};

    margin-bottom: ${space[5]}px;
    ${from.tablet} {
      margin-bottom: ${space[6]}px;
    }
    ${from.desktop} {
      margin-bottom: ${space[9]}px;
    }
  `;
};

export const ConsentsNewslettersPage = () => {
  const globalState = useContext<GlobalState>(GlobalStateContext);
  const newsletters = globalState?.pageData?.newsletters ?? [];
  const autoRow = getAutoRow(1, gridItemColumnConsents);
  return (
    <ConsentsLayout title="Newsletters" current={CONSENTS_PAGES.NEWSLETTERS}>
      <h3 css={[heading, autoRow()]}>Free newsletters from The Guardian</h3>
      <p css={[text, autoRow()]}>
        Our newsletters help you get closer to our quality, independent
        journalism.
      </p>
      {newsletters.map((newsletter, i) => (
        <NewsletterCard
          newsletter={newsletter}
          key={newsletter.id}
          cssOverides={getNewsletterCardCss(i)}
        />
      ))}
    </ConsentsLayout>
  );
};
