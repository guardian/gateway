import React from 'react';
import { css } from '@emotion/react';
import { from, space } from '@guardian/source-foundations';
import {
  gridItem,
  gridItemColumnConsents,
  getAutoRow,
  SpanDefinition,
} from '@/client/styles/Grid';
import { CONSENTS_PAGES } from '@/client/models/ConsentsPages';
import { NewsletterCard } from '@/client/components/NewsletterCard';
import { greyBorderTop, heading, text } from '@/client/styles/Consents';
import { ConsentsLayout } from '@/client/layouts/ConsentsLayout';
import { ConsentsContent } from '@/client/layouts/shared/Consents';
import { NewsLetter } from '@/shared/model/Newsletter';

type ConsentsNewslettersProps = {
  newsletters: NewsLetter[];
};

const getNewsletterCardCss = (index: number) => {
  const ITEMS_PER_ROW = 2;
  const OFFSET = 4;
  const row = Math.trunc(index / ITEMS_PER_ROW) + OFFSET;
  const column = index % ITEMS_PER_ROW;

  const gridDef: SpanDefinition = {
    TABLET: { start: 2 + column * 5, span: 5 },
    DESKTOP: { start: 2 + column * 5, span: 5 },
    LEFT_COL: { start: 2 + column * 6, span: 6 },
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

export const ConsentsNewsletters = ({
  newsletters,
}: ConsentsNewslettersProps) => {
  const autoRow = getAutoRow(1, gridItemColumnConsents);

  return (
    <ConsentsLayout title="Newsletters" current={CONSENTS_PAGES.NEWSLETTERS}>
      <ConsentsContent>
        <h2 css={[heading, greyBorderTop, autoRow()]}>
          Free newsletters from the Guardian
        </h2>
        <p css={[text, paragraphSpacing, autoRow()]}>
          Our newsletters help you get closer to our quality, independent
          journalism.
        </p>
        <div css={autoRow()}>
          {newsletters.map((newsletter, i) => (
            <NewsletterCard
              newsletter={newsletter}
              key={newsletter.id}
              cssOverrides={getNewsletterCardCss(i)}
            />
          ))}
        </div>
      </ConsentsContent>
    </ConsentsLayout>
  );
};
