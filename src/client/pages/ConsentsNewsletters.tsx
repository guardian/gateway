import React, { useContext } from 'react';
import { ConsentsLayout } from '@/client/layouts/ConsentsLayout';
import { css } from '@emotion/react';
import { space } from '@guardian/src-foundations';
import {
  gridItem,
  gridItemColumnConsents,
  getAutoRow,
  consentsParagraphSpanDef,
} from '@/client/styles/Grid';
import { ClientStateContext } from '@/client/components/ClientState';
import { CONSENTS_PAGES } from '@/client/models/ConsentsPages';
import { ClientState } from '@/shared/model/ClientState';
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

const paragraphSpacing = css`
  margin-bottom: ${space[6]}px;
`;

export const ConsentsNewslettersPage = () => {
  const clientState = useContext<ClientState>(ClientStateContext);
  const newsletters = clientState?.pageData?.newsletters ?? [];
  const autoRow = getAutoRow(1, gridItemColumnConsents);
  return (
    <ConsentsLayout title="Newsletters" current={CONSENTS_PAGES.NEWSLETTERS}>
      <h2 css={[heading, autoRow()]}>Free newsletters from The Guardian</h2>
      <p css={[text, paragraphSpacing, autoRow(consentsParagraphSpanDef)]}>
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
