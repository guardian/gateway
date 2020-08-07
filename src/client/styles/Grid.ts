import { css } from '@emotion/core';
import { space } from '@guardian/src-foundations';
import { from } from '@guardian/src-foundations/mq';

export enum COLUMNS {
  MOBILE = 4,
  TABLET = 12,
  DESKTOP = 12,
  WIDE = 16,
}

enum COLUMN_WIDTH {
  MOBILE = 'minmax(0, 1fr)',
  TABLET = '40px',
  DESKTOP = '60px',
  WIDE = '60px',
}

enum SPACING {
  MOBILE = space[3],
  TABLET = space[5],
  DESKTOP = space[5],
  WIDE = space[5],
}

interface SpanDefinitionStartSpan {
  start: number;
  span: number;
}

interface SpanDefinition {
  MOBILE?: SpanDefinitionStartSpan;
  TABLET?: SpanDefinitionStartSpan;
  DESKTOP?: SpanDefinitionStartSpan;
  WIDE?: SpanDefinitionStartSpan;
}

const defaultSpanDefinition: Required<SpanDefinition> = {
  MOBILE: {
    start: 1,
    span: COLUMNS.MOBILE,
  },
  TABLET: { start: 1, span: COLUMNS.TABLET },
  DESKTOP: { start: 1, span: COLUMNS.DESKTOP },
  WIDE: { start: 1, span: COLUMNS.WIDE },
};

const px = (num: number) => `${num}px`;

const mw = (c: number, cw: number, gw: number, pw: number): number =>
  cw * c + (c - 1) * gw + 2 * pw;

export enum MAX_WIDTH {
  TABLET = mw(COLUMNS.TABLET, 40, space[5], space[5]),
  DESKTOP = mw(COLUMNS.DESKTOP, 60, space[5], space[5]),
  WIDE = mw(COLUMNS.WIDE, 60, space[5], space[5]),
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

  ${from.desktop} {
    grid-template-columns: repeat(${COLUMNS.DESKTOP}, ${COLUMN_WIDTH.DESKTOP});
    padding-left: ${px(SPACING.DESKTOP)};
    padding-right: ${px(SPACING.DESKTOP)};
    max-width: ${px(MAX_WIDTH.DESKTOP)};
  }

  ${from.wide} {
    grid-template-columns: repeat(${COLUMNS.WIDE}, ${COLUMN_WIDTH.WIDE});
    padding-left: ${px(SPACING.WIDE)};
    padding-right: ${px(SPACING.WIDE)};
    max-width: ${px(MAX_WIDTH.WIDE)};
  }
`;

export const gridItem = (spanDefinition?: SpanDefinition) => {
  const { MOBILE, TABLET, DESKTOP, WIDE } = {
    ...defaultSpanDefinition,
    ...spanDefinition,
  };

  return css`
    grid-column: ${MOBILE.start} / span ${MOBILE.span};

    ${from.tablet} {
      grid-column: ${TABLET.start} / span ${TABLET.span};
    }

    ${from.desktop} {
      grid-column: ${DESKTOP.start} / span ${DESKTOP.span};
    }

    ${from.wide} {
      grid-column: ${WIDE.start} / span ${WIDE.span};
    }
  `;
};

export const gridItemColumnConsents: SpanDefinition = {
  TABLET: { start: 2, span: 10 },
  DESKTOP: { start: 2, span: 10 },
  WIDE: { start: 3, span: 12 },
};
