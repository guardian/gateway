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
import { ConsentCardOnboarding } from '@/client/components/ConsentCardOnboardingEmails';
import { ConsentCard } from '@/client/components/ConsentCard';
import { ConsentsForm } from '@/client/components/ConsentsForm';
import { ConsentsNavigation } from '@/client/components/ConsentsNavigation';
import { ConsentsLayout } from '@/client/layouts/ConsentsLayout';
import { Consent } from '@/shared/model/Consent';
import { NewsLetter } from '@/shared/model/Newsletter';
import {
  NEWSLETTER_IMAGES,
  NEWSLETTER_IMAGE_POSITIONS,
} from '@/client/models/Newsletter';
import { CONSENT_IMAGES } from '@/client/models/ConsentImages';
import { h1, h1ResponsiveText } from '../styles/Consents';

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
  defaultOnboardingEmailId: string;
  defaultOnboardingEmailConsentState: boolean;
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

export const ConsentsNewslettersAB = ({
  consents,
  defaultOnboardingEmailId,
  defaultOnboardingEmailConsentState,
}: ConsentsNewslettersProps) => {
  const autoRow = getAutoRow(1, gridItemColumnConsents);

  return (
    <ConsentsLayout title="Newsletters" current={CONSENTS_PAGES.NEWSLETTERS}>
      <ConsentsForm cssOverrides={autoRow()}>
        <ConsentCardOnboarding
          id={defaultOnboardingEmailId}
          defaultChecked={defaultOnboardingEmailConsentState}
        />
        <h1 css={[h1, h1ResponsiveText, autoRow()]}>You might also like...</h1>
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
                  id: consent.id,
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
