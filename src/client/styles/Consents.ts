import { css } from '@emotion/react';
import {
  from,
  space,
  headline,
  textSans,
  body,
  neutral,
} from '@guardian/source-foundations';

export const heading = css`
  color: ${neutral[0]};
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

export const textEgyptian = css`
  ${body.medium()}
  margin: 0;
  color: ${neutral[20]};
  max-width: 640px;
`;

export const greyBorderTop = css`
  border-top: 1px solid ${neutral[86]};
  padding-top: ${space[1]}px;
`;

export const greyBorderBottom = css`
  border-bottom: 1px solid ${neutral[86]};
  padding-bottom: ${space[1]}px;
`;

export const passwordButton = css`
  width: 100%;
  justify-content: center;
`;
