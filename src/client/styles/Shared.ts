import { css } from '@emotion/react';
import { from, space } from '@guardian/source-foundations';

export const button = css`
  width: 100%;

  ${from.mobileMedium} {
    width: max-content;
  }
`;

export const topMargin = css`
  margin-top: ${space[2]}px;
  ${from.mobileMedium} {
    margin-top: ${space[4]}px;
  }
  ${from.tablet} {
    margin-top: ${space[6]}px;
  }
`;

export const disableAutofillBackground = css`
  :-webkit-autofill {
    background-color: transparent !important;
    box-shadow: 0 0 0 50px white inset;
  }
  :autofill {
    background-color: transparent !important;
    box-shadow: 0 0 0 50px white inset;
  }
`;

export const noBorderRadius = css`
  border-radius: 0;
`;
