import { css } from '@emotion/core';
import { from } from '@guardian/src-foundations/mq';
import { space } from '@guardian/src-foundations';

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
