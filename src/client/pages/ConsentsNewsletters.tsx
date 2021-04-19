import React, { useContext } from 'react';
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
import { useAB } from '@guardian/ab-react';
import { ABNewsletterCard } from '@/client/components/NewsletterCardAB';
import { ConsentsLayout } from '@/client/layouts/ConsentsLayout';
import {
  CONSENTS_MAIN_COLOR,
  ConsentsContent,
} from '@/client/layouts/shared/Consents';

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

const getNewsletterCardCssAB = () => {
  const gridDef = {
    TABLET: { start: 2, span: 10 },
    DESKTOP: { start: 2, span: 10 },
    WIDE: { start: 3, span: 12 },
  };

  return css`
    ${gridItem(gridDef)}
    -ms-grid-row: 4;

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

  // @AB_TEST: Single Newsletter Test: START
  const ABTestAPI = useAB();
  const isUserInTest = ABTestAPI.isUserInVariant(
    'SingleNewsletterTest',
    'variant',
  );
  // @AB_TEST: Single Newsletter Test: END

  return (
    <ConsentsLayout
      title="Newsletters"
      current={CONSENTS_PAGES.NEWSLETTERS}
      bgColor={CONSENTS_MAIN_COLOR}
    >
      <ConsentsContent>
        <h2 css={[heading, autoRow()]}>Free newsletters from The Guardian</h2>
        <p css={[text, paragraphSpacing, autoRow(consentsParagraphSpanDef)]}>
          Our newsletters help you get closer to our quality, independent
          journalism.
        </p>
        {isUserInTest ? (
          <ABNewsletterCard
            newsletter={newsletters[0]}
            key={newsletters[0].id}
            cssOverrides={getNewsletterCardCssAB()}
          />
        ) : (
          newsletters.map((newsletter, i) => (
            <NewsletterCard
              newsletter={newsletter}
              key={newsletter.id}
              cssOverrides={getNewsletterCardCss(i)}
            />
          ))
        )}
      </ConsentsContent>
    </ConsentsLayout>
  );
};
