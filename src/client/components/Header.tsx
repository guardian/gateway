import React from 'react';
import { css } from '@emotion/react';
import { brand, space } from '@guardian/src-foundations';
import { from } from '@guardian/src-foundations/mq';
import { Logo } from '@guardian/source-react-components-development-kitchen';
import { gridRow, manualRow, SpanDefinition } from '@/client/styles/Grid';

const bottomMarginStyles = css`
  margin-bottom: ${space[6]}px;
  ${from.tablet} {
    margin-bottom: 18px;
  }
`;

const topMarginStyles = css`
  margin-top: ${space[5]}px;
  ${from.mobileMedium} {
    margin-top: 14px;
  }
  ${from.tablet} {
    margin-top: ${space[2]}px;
  }
`;

const sideMarginStyles = css`
  margin-left: auto;
  margin-right: auto;
`;

const backgroundColor = css`
  background-color: ${brand[400]};
`;

const headerGridRightToLeft = css`
  direction: rtl;
`;

const headerSpanDefinition: SpanDefinition = {
  TABLET: {
    start: 9,
    span: 4,
  },
  DESKTOP: {
    start: 9,
    span: 4,
  },
  LEFT_COL: {
    start: 11,
    span: 4,
  },
  WIDE: {
    start: 12,
    span: 4,
  },
};

export const Header = () => (
  <header id="top" css={backgroundColor}>
    <div css={[gridRow, topMarginStyles, bottomMarginStyles, sideMarginStyles]}>
      <div css={[manualRow(1, headerSpanDefinition), headerGridRightToLeft]}>
        <Logo logoType="bestWebsite" />
      </div>
    </div>
  </header>
);
