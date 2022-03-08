import React from 'react';
import { css } from '@emotion/react';
import {
  brand,
  culture,
  from,
  lifestyle,
  news,
  space,
} from '@guardian/source-foundations';
import {
  gridItem,
  gridItemColumnConsents,
  getAutoRow,
  SpanDefinition,
} from '@/client/styles/Grid';
import { CONSENTS_PAGES } from '@/client/models/ConsentsPages';
import { ConsentCard } from '@/client/components/ConsentCard';
import { ConsentsForm } from '@/client/components/ConsentsForm';
import { ConsentsNavigation } from '@/client/components/ConsentsNavigation';
import { greyBorderTop, heading, text } from '@/client/styles/Consents';
import { ConsentsLayout } from '@/client/layouts/ConsentsLayout';
import { NewsLetter } from '@/shared/model/Newsletter';
import { NEWSLETTER_IMAGES } from '@/client/models/Newsletter';

type ConsentsNewslettersProps = {
  newsletters: NewsLetter[];
};

const idColor = (id: string) => {
  if (/today|morning/.test(id)) {
    return news[400];
  }
  if (id === 'the-long-read') {
    return brand[400];
  }
  if (id === 'green-light') {
    return news[400];
  }
  if (id === 'bookmarks') {
    return culture[400];
  }
  if (id === 'word-of-mouth' || id === 'the-guide-staying-in') {
    return lifestyle[400];
  }
  return brand[400];
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
      <h2 css={[heading, greyBorderTop, autoRow()]}>
        Free newsletters from the Guardian
      </h2>
      <p css={[text, autoRow()]}>
        Our newsletters help you get closer to our quality, independent
        journalism.
      </p>
      <p css={[text, paragraphSpacing, autoRow()]}>
        Newsletters may contain information about Guardian products, services
        and chosen charities or online advertisements.
      </p>
      <ConsentsForm cssOverrides={autoRow()}>
        {newsletters.map((newsletter, i) => (
          <ConsentCard
            title={newsletter.name}
            description={newsletter.description}
            id={newsletter.id}
            defaultChecked={newsletter.subscribed}
            imagePath={NEWSLETTER_IMAGES[newsletter.id]}
            highlightColor={idColor(newsletter.nameId)}
            frequency={newsletter.frequency}
            hiddenInput
            cssOverrides={getNewsletterCardCss(i)}
            key={newsletter.id}
          />
        ))}
        <ConsentsNavigation />
      </ConsentsForm>
    </ConsentsLayout>
  );
};
