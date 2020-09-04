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

const generateGridRowCss = (
  padding: number,
  columnWidth: string,
  columnNumber: number,
  maxWidth?: number,
) => `
    -ms-grid-columns: (${columnWidth} 20px\)[${
  columnNumber - 1
}] ${columnWidth};
    grid-template-columns: repeat(${columnNumber}, ${columnWidth});
    padding-left: ${px(padding)};
    padding-right: ${px(padding)};
    max-width: ${maxWidth ? px(maxWidth) : '100%'};
`;

export const gridRow = css`
  display: -ms-grid;
  display: grid;
  width: 100%;
  column-gap: ${px(space[5])};

  -ms-grid-columns: (${COLUMN_WIDTH.MOBILE}\)[${COLUMNS.MOBILE}];
  grid-template-columns: repeat(${COLUMNS.MOBILE}, ${COLUMN_WIDTH.MOBILE});
  padding-left: ${px(SPACING.MOBILE)};
  padding-right: ${px(SPACING.MOBILE)};

  ${generateGridRowCss(SPACING.MOBILE, COLUMN_WIDTH.MOBILE, COLUMNS.MOBILE)}

  ${from.tablet} {
    ${generateGridRowCss(
      SPACING.TABLET,
      COLUMN_WIDTH.TABLET,
      COLUMNS.TABLET,
      MAX_WIDTH.TABLET,
    )}
  }

  ${from.desktop} {
    ${generateGridRowCss(
      SPACING.DESKTOP,
      COLUMN_WIDTH.DESKTOP,
      COLUMNS.DESKTOP,
      MAX_WIDTH.DESKTOP,
    )}
  }

  ${from.wide} {
    ${generateGridRowCss(
      SPACING.WIDE,
      COLUMN_WIDTH.WIDE,
      COLUMNS.WIDE,
      MAX_WIDTH.WIDE,
    )}
  }
`;

const generateGridItemCss = (columnStart: number, columnSpan: number) => `
  -ms-grid-column: ${columnStart * 2 - 1};
  -ms-grid-column-span: ${columnSpan * 2 - 1};
  grid-column: ${columnStart} / span ${columnSpan};
`;

export const gridItem = (spanDefinition?: SpanDefinition) => {
  const { MOBILE, TABLET, DESKTOP, WIDE } = {
    ...defaultSpanDefinition,
    ...spanDefinition,
  };

  return css`
    ${generateGridItemCss(MOBILE.start, MOBILE.span)}

    ${from.tablet} {
      ${generateGridItemCss(TABLET.start, TABLET.span)}
    }

    ${from.desktop} {
      ${generateGridItemCss(DESKTOP.start, DESKTOP.span)}
    }

    ${from.wide} {
      ${generateGridItemCss(WIDE.start, WIDE.span)}
    }
  `;
};

export const gridItemColumnConsents: SpanDefinition = {
  TABLET: { start: 2, span: 10 },
  DESKTOP: { start: 2, span: 10 },
  WIDE: { start: 3, span: 12 },
};

export const getAutoRow = (offset = 0, spanDefinition?: SpanDefinition) => {
  let row = offset;
  return () => {
    return css`
      ${gridItem(spanDefinition)}
      -ms-grid-row: ${++row};
    `;
  };
};
