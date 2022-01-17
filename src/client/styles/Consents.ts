import { css } from '@emotion/react';
import {
  from,
  space,
  headline,
  textSans,
  text as textPalette,
  neutral,
} from '@guardian/source-foundations';

export const heading = css`
  color: ${textPalette.ctaSecondary};
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
  color: ${neutral[20]};
  ${textSans.medium()}
  max-width: 640px;
`;
