import { css } from '@emotion/react';
import { from } from '@guardian/src-foundations/mq';
import { space } from '@guardian/src-foundations';
import { MAX_WIDTH } from './Grid';

export const linkButton = css`
  width: 100%;

  ${from.mobileMedium} {
    width: max-content;
  }
`;

export const button = css`
  width: 100%;

  ${from.mobileMedium} {
    width: max-content;
  }
`;

export const textInput = css`
  margin-bottom: ${space[3]}px;
`;

export const form = css`
  padding: ${space[2]}px 0px;
`;

export const maxWidth = css`
  ${from.tablet} {
    max-width: ${MAX_WIDTH.TABLET}px;
  }

  ${from.desktop} {
    max-width: ${MAX_WIDTH.DESKTOP}px;
  }

  ${from.wide} {
    max-width: ${MAX_WIDTH.WIDE}px;
  }
`;
