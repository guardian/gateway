import { css } from '@emotion/react';
import {
  space,
  headline,
  textSans,
  neutral,
} from '@guardian/source-foundations';

export const heading = css`
  color: ${neutral[0]};
  margin: 0 0 ${space[3]}px;
  ${headline.xxxsmall({ fontWeight: 'bold' })};
`;

export const headingMarginSpace6 = css`
  margin-top: ${space[6]}px;
`;

export const text = css`
  margin: 0;
  color: ${neutral[7]};
  ${textSans.medium()}
  max-width: 640px;
`;

export const textBold = css`
  ${text};
  font-weight: bold;
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
