import { css } from '@emotion/core';
import { space } from '@guardian/src-foundations';

const px = (num: number) => `${num}px`;

export const gridRow = css`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  column-gap: ${px(space[5])};
  padding: 0 ${px(space[3])};
  width: 100%;
`;

export const gridItem = (start = 1, span = 4) => css`
  grid-column: ${start} / span ${span};
`;
