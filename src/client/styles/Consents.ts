import { css } from '@emotion/core';
import { space, palette } from '@guardian/src-foundations';
import { headline, textSans } from '@guardian/src-foundations/typography';
import { from } from '@guardian/src-foundations/mq';

export const heading = css`
  color: ${palette.text.ctaSecondary};
  margin: 0 0 ${space[3]}px;
  ${headline.xxsmall({ fontWeight: 'bold' })};
`;

export const headingMarginSpace6 = css`
  margin-top: ${space[6]}px;
`;

export const headingWithMq = css`
  ${heading}

  ${from.tablet} {
    ${headline.xxsmall({ fontWeight: 'bold' })}
  }
`;

export const text = css`
  margin: 0;
  color: ${palette.neutral[20]};
  ${textSans.medium()}
`;
