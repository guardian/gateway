import React from 'react';
import { css } from '@emotion/react';
import { brand } from '@guardian/src-foundations/palette';
import { space } from '@guardian/src-foundations';
import { AutoRow, gridItemColumnConsents, gridRow } from '@/client/styles/Grid';
import { from } from '@guardian/src-foundations/mq';
import { titlepiece } from '@guardian/src-foundations/typography';
import { PageProgression } from '@/client/components/PageProgression';
import { CONSENTS_PAGES_ARR } from '@/client/models/ConsentsPages';
import { CONSENTS_MAIN_COLOR } from '@/client/layouts/shared/Consents';

type Props = {
  autoRow: AutoRow;
  title: string;
  current?: string;
};

const consentsBackground = css`
  background-color: ${CONSENTS_MAIN_COLOR};
`;

// fixes overlapping text issue in IE
// derived from this solution https://stackoverflow.com/a/49368815
const ieFlexFix = css`
  flex: 0 0 auto;
`;

const blueBorder = css`
  margin: 0 auto;

  ${from.tablet} {
    border-left: 1px solid ${brand[400]};
    border-right: 1px solid ${brand[400]};
  }
`;

const h1 = css`
  color: ${brand[400]};
  margin: ${space[12]}px 0 ${space[5]}px 0;
  ${titlepiece.small({ fontWeight: 'bold' })};
  font-size: 38px;
  line-height: 1;
  ${from.tablet} {
    ${titlepiece.medium({ fontWeight: 'bold' })};
    font-size: 42px;
  }
  ${from.desktop} {
    ${titlepiece.large({ fontWeight: 'bold' })};
    font-size: 50px;
  }
`;

const pageProgression = css`
  margin-top: ${space[5]}px;
  margin-bottom: 0;
  li {
    color: ${brand[400]};
    &::after {
      background-color: ${brand[400]};
    }
    &::before {
      border: 2px solid ${brand[400]};
      background-color: white;
    }
  }
`;

export const ConsentsSubHeader = ({ autoRow, title, current }: Props) => (
  <header css={[consentsBackground, ieFlexFix]}>
    <div css={[blueBorder, gridRow]}>
      {current && (
        <PageProgression
          cssOverrides={[pageProgression, autoRow(gridItemColumnConsents)]}
          pages={CONSENTS_PAGES_ARR}
          current={current}
        />
      )}
      <h1 css={[h1, autoRow(gridItemColumnConsents)]}>{title}</h1>
    </div>
  </header>
);
