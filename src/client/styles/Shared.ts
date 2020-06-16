import { css } from '@emotion/core';
import { from } from '@guardian/src-foundations/mq';

export const linkButton = css`
  width: 100%;

  ${from.mobileMedium} {
    width: max-content;
  }
`;
