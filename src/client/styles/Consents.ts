import { css } from '@emotion/react';
import {
  space,
  headline,
  textSans,
  neutral,
  from,
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
  ${textSans.medium()}
  max-width: 640px;
`;

export const textBold = css`
  ${text};
  font-weight: bold;
`;

const greyBorder = `1px solid ${neutral[86]}`;

export const greyBorderTop = css`
  border-top: ${greyBorder};
  padding-top: ${space[1]}px;
`;

export const greyBorderBottom = css`
  border-bottom: ${greyBorder};
  padding-bottom: ${space[1]}px;
`;

export const greyBorderSides = css`
  margin: 0 auto;

  ${from.tablet} {
    border-left: ${greyBorder};
    border-right: ${greyBorder};
  }
`;

export const passwordButton = css`
  width: 100%;
  justify-content: center;
`;

export const controls = css`
  padding: 22px 0 64px;
  ${from.tablet} {
    padding-bottom: ${space[24]}px;
  }
`;
