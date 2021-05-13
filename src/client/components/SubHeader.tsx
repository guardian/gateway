import * as React from 'react';
import { css } from '@emotion/react';
import { brand, space, neutral } from '@guardian/src-foundations';
import { headline } from '@guardian/src-foundations/typography';
import { from } from '@guardian/src-foundations/mq';
import { Breakpoints } from '@/client/models/Style';

const header = css`
  width: 100%;
  padding-top: ${space[9]}px;
  background-color: ${brand[300]};
  display: flex;
  align-items: flex-end;
  justify-content: center;

  ${from.mobileMedium} {
    padding-top: ${space[12]}px;
  }

  ${from.tablet} {
    padding-top: ${space[24]}px;
  }

  ${from.desktop} {
    padding-top: calc(${space[24]}px + ${space[6]}px);
  }
`;

const div = css`
  max-width: ${Breakpoints.TABLET}px;
  width: 100%;
  padding: 0 ${space[3]}px;
  margin-right: 0;

  ${from.mobileMedium} {
    margin-right: ${space[24]}px;
  }

  ${from.tablet} {
    margin-right: 0;
  }
`;

const h1 = css`
  width: 100%;
  margin: 0;
  padding: ${space[1]}px ${space[2]}px;
  color: ${neutral[100]};
  border: 1px solid ${brand[600]};
  box-sizing: border-box;
  ${headline.xsmall({ fontWeight: 'bold', lineHeight: 'tight' })}

  ${from.tablet} {
    margin: 0;
    ${headline.large({ fontWeight: 'bold', lineHeight: 'regular' })}
  }
`;

export const SubHeader = () => (
  <header css={header}>
    <div css={div}>
      <h1 css={h1}>Sign in</h1>
    </div>
  </header>
);
