import { css } from '@emotion/core';
import { space } from '@guardian/src-foundations';
import { from } from '@guardian/src-foundations/mq';

enum COLUMNS {
  MOBILE = 4,
  TABLET = 12,
}

enum COLUMN_WIDTH {
  MOBILE = 'minmax(0, 1fr)',
  TABLET = '40px',
}

enum SPACING {
  MOBILE = space[3],
  TABLET = space[5],
}

interface SpanDefinitionStartSpan {
  start: number;
  span: number;
}

interface SpanDefinition {
  MOBILE?: SpanDefinitionStartSpan;
  TABLET?: SpanDefinitionStartSpan;
}

const defaultSpanDefinition: Required<SpanDefinition> = {
  MOBILE: {
    start: 1,
    span: COLUMNS.MOBILE,
  },
  TABLET: { start: 1, span: COLUMNS.TABLET },
};

const px = (num: number) => `${num}px`;

const mw = (c: number, cw: number, gw: number, pw: number): number =>
  cw * c + (c - 1) * gw + 2 * pw;

export enum MAX_WIDTH {
  TABLET = mw(12, 40, space[5], space[5]),
}

export const gridRow = css`
  display: grid;
  grid-template-columns: repeat(${COLUMNS.MOBILE}, ${COLUMN_WIDTH.MOBILE});
  column-gap: ${px(space[5])};
  padding-left: ${px(SPACING.MOBILE)};
  padding-right: ${px(SPACING.MOBILE)};
  width: 100%;

  ${from.tablet} {
    grid-template-columns: repeat(${COLUMNS.TABLET}, ${COLUMN_WIDTH.TABLET});
    padding-left: ${px(SPACING.TABLET)};
    padding-right: ${px(SPACING.TABLET)};
    max-width: ${px(MAX_WIDTH.TABLET)};
  }
`;

export const gridItem = (spanDefinition?: SpanDefinition) => {
  const { MOBILE, TABLET } = { ...defaultSpanDefinition, ...spanDefinition };

  return css`
    grid-column: ${MOBILE.start} / span ${MOBILE.span};

    ${from.tablet} {
      grid-column: ${TABLET.start} / span ${TABLET.span};
    }
  `;
};

export const gridItemColumnConsents: SpanDefinition = {
  TABLET: { start: 2, span: 10 },
};
