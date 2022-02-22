import { SerializedStyles, css } from '@emotion/react';
import { from, space } from '@guardian/source-foundations';

export enum COLUMNS {
  MOBILE = 4,
  MOBILE_MEDIUM = 4,
  MOBILE_LANDSCAPE = 4,
  TABLET = 12,
  DESKTOP = 12,
  LEFT_COL = 14,
  WIDE = 16,
}

enum COLUMN_WIDTH {
  MOBILE = 'minmax(0, 1fr)',
  MOBILE_MEDIUM = 'minmax(0, 1fr)',
  MOBILE_LANDSCAPE = 'minmax(0, 1fr)',
  TABLET = '40px',
  DESKTOP = '60px',
  LEFT_COL = '60px',
  WIDE = '60px',
}

enum SPACING {
  MOBILE = 10,
  MOBILE_MEDIUM = 10,
  MOBILE_LANDSCAPE = space[5],
  TABLET = space[5],
  DESKTOP = space[5],
  LEFT_COL = space[5],
  WIDE = space[5],
}

export type AutoRow = (
  customSpanDefinition?: SpanDefinition | undefined,
) => SerializedStyles;

interface SpanDefinitionStartSpan {
  start: number;
  span: number;
}

// the SpanDefinition defines for each breakpoint
// on which column the item should start
// and how many columns it should span
// if a breakpoint isn't provided, it will use the
// defaultSpanDefinition
export interface SpanDefinition {
  MOBILE?: SpanDefinitionStartSpan;
  MOBILE_MEDIUM?: SpanDefinitionStartSpan;
  MOBILE_LANDSCAPE?: SpanDefinitionStartSpan;
  TABLET?: SpanDefinitionStartSpan;
  DESKTOP?: SpanDefinitionStartSpan;
  LEFT_COL?: SpanDefinitionStartSpan;
  WIDE?: SpanDefinitionStartSpan;
}

// the default span definition spans the whole row
// for each breakpoint
const defaultSpanDefinition: Required<SpanDefinition> = {
  MOBILE: {
    start: 1,
    span: COLUMNS.MOBILE,
  },
  MOBILE_MEDIUM: {
    start: 1,
    span: COLUMNS.MOBILE_MEDIUM,
  },
  MOBILE_LANDSCAPE: {
    start: 1,
    span: COLUMNS.MOBILE_LANDSCAPE,
  },
  TABLET: { start: 1, span: COLUMNS.TABLET },
  DESKTOP: { start: 1, span: COLUMNS.DESKTOP },
  LEFT_COL: { start: 1, span: COLUMNS.LEFT_COL },
  WIDE: { start: 1, span: COLUMNS.WIDE },
};

const px = (num: number) => `${num}px`;

const maxWidth = (
  numColumns: number,
  columnWidth: number,
  gapSize: number,
  paddingSize: number,
): number =>
  columnWidth * numColumns + (numColumns - 1) * gapSize + 2 * paddingSize;

export enum MAX_WIDTH {
  TABLET = maxWidth(COLUMNS.TABLET, 40, space[5], space[5]),
  DESKTOP = maxWidth(COLUMNS.DESKTOP, 60, space[5], space[5]),
  LEFT_COL = maxWidth(COLUMNS.LEFT_COL, 60, space[5], space[5]),
  WIDE = maxWidth(COLUMNS.WIDE, 60, space[5], space[5]),
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

// this styles should be applied to an element to make it behave as
// the grid container, it defines the css on how all the breakpoints
// should behave
// anything items should be added inside this container, and use
// either the autoRow/getAutoRow or manualRow functionality to layout the items
export const gridRow = css`
  display: -ms-grid;
  display: grid;
  width: 100%;

  /* column-gap is always 20px on all breakpoints */
  column-gap: ${px(space[5])};

  ${generateGridRowCss(SPACING.MOBILE, COLUMN_WIDTH.MOBILE, COLUMNS.MOBILE)}

  ${from.mobileMedium} {
    ${generateGridRowCss(
      SPACING.MOBILE_MEDIUM,
      COLUMN_WIDTH.MOBILE_MEDIUM,
      COLUMNS.MOBILE_MEDIUM,
    )}
  }

  ${from.mobileLandscape} {
    ${generateGridRowCss(
      SPACING.MOBILE_LANDSCAPE,
      COLUMN_WIDTH.MOBILE_LANDSCAPE,
      COLUMNS.MOBILE_LANDSCAPE,
    )}
  }

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

  ${from.leftCol} {
    ${generateGridRowCss(
      SPACING.LEFT_COL,
      COLUMN_WIDTH.LEFT_COL,
      COLUMNS.LEFT_COL,
      MAX_WIDTH.LEFT_COL,
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
  const {
    MOBILE,
    MOBILE_MEDIUM,
    MOBILE_LANDSCAPE,
    TABLET,
    DESKTOP,
    LEFT_COL,
    WIDE,
  } = {
    ...defaultSpanDefinition,
    ...spanDefinition,
  };

  return css`
    ${generateGridItemCss(MOBILE.start, MOBILE.span)}

    ${from.mobileMedium} {
      ${generateGridItemCss(MOBILE_MEDIUM.start, MOBILE_MEDIUM.span)}
    }

    ${from.mobileLandscape} {
      ${generateGridItemCss(MOBILE_LANDSCAPE.start, MOBILE_LANDSCAPE.span)}
    }

    ${from.tablet} {
      ${generateGridItemCss(TABLET.start, TABLET.span)}
    }

    ${from.desktop} {
      ${generateGridItemCss(DESKTOP.start, DESKTOP.span)}
    }

    ${from.leftCol} {
      ${generateGridItemCss(LEFT_COL.start, LEFT_COL.span)}
    }

    ${from.wide} {
      ${generateGridItemCss(WIDE.start, WIDE.span)}
    }
  `;
};

export const gridItemColumnConsents: SpanDefinition = {
  TABLET: { start: 1, span: 10 },
  DESKTOP: { start: 3, span: 8 },
  LEFT_COL: { start: 3, span: 8 },
  WIDE: { start: 4, span: 8 },
};

export const passwordFormSpanDef: SpanDefinition = {
  TABLET: { start: 1, span: 8 },
  DESKTOP: { start: 3, span: 6 },
  LEFT_COL: { start: 3, span: 6 },
  WIDE: { start: 4, span: 6 },
};

export const gridItemSignInAndRegistration: SpanDefinition = {
  TABLET: { start: 1, span: 8 },
  DESKTOP: { start: 2, span: 6 },
  LEFT_COL: { start: 3, span: 6 },
  WIDE: { start: 4, span: 6 },
};

export const getAutoRow = (
  offset = 0,
  spanDefinition?: SpanDefinition,
): AutoRow => {
  let row = offset;
  return (customSpanDefinition = spanDefinition) => css`
    ${gridItem(customSpanDefinition)}
    -ms-grid-row: ${++row};
  `;
};

export const manualRow = (row: number, spanDefinition?: SpanDefinition) => css`
  ${gridItem(spanDefinition)}
  -ms-grid-row: ${row};
  grid-row: ${row};
`;
