import React from 'react';
import { css } from '@emotion/react';
import {
  brand,
  from,
  lifestyle,
  news,
  space,
  neutral,
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
import { Consent } from '@/shared/model/Consent';
import { NewsLetter } from '@/shared/model/Newsletter';
import {
  NEWSLETTER_IMAGES,
  NEWSLETTER_IMAGE_POSITIONS,
} from '@/client/models/Newsletter';
import { CONSENT_IMAGES } from '@/client/models/ConsentImages';

interface ConsentOption {
  type: 'consent';
  consent: Consent;
}
interface NewsletterOption {
  type: 'newsletter';
  consent: NewsLetter;
}
type NewsletterPageConsent = ConsentOption | NewsletterOption;

type ConsentsNewslettersProps = {
  consents: NewsletterPageConsent[];
};

const idColor = (id: string) => {
  if (/morning/.test(id)) {
    return news[400];
  }
  if (id === 'the-long-read') {
    return brand[400];
  }
  if (id === 'green-light') {
    return news[400];
  }
  if (id === 'the-guide-staying-in') {
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

export const ConsentsNewsletters = ({ consents }: ConsentsNewslettersProps) => {
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
        {consents.map(({ type, consent }, i) => {
          const extraProps =
            type === 'consent'
              ? {
                  id: consent.id,
                  defaultChecked: !!consent.consented,
                  highlightColor: neutral[46],
                  imagePath: CONSENT_IMAGES[consent.id],
                }
              : {
                  id: consent.id, // TODO: adjust this to differentiate on backend
                  defaultChecked: consent.subscribed,
                  imagePath: NEWSLETTER_IMAGES[consent.id],
                  imagePosition: NEWSLETTER_IMAGE_POSITIONS[consent.id],
                  highlightColor: idColor(consent.nameId),
                  frequency: consent.frequency,
                  hiddenInput: true,
                };

          return (
            <ConsentCard
              key={consent.id}
              title={consent.name}
              description={consent.description || ''}
              noTopBorderMobile
              cssOverrides={getNewsletterCardCss(i)}
              {...extraProps}
            />
          );
        })}
        <ConsentsNavigation />
      </ConsentsForm>
    </ConsentsLayout>
  );
};
