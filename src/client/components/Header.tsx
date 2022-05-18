import React from 'react';
import { css, SerializedStyles } from '@emotion/react';
import { brand, from, space } from '@guardian/source-foundations';
import { Logo } from '@guardian/source-react-components-development-kitchen';
import { gridRow, manualRow, SpanDefinition } from '@/client/styles/Grid';

const marginStyles = css`
  margin-top: ${space[5]}px;
  margin-bottom: 21px;
  margin-left: auto;
  margin-right: auto;
  ${from.mobileMedium} {
    margin-top: 14px;
  }
  ${from.tablet} {
    margin-top: ${space[2]}px;
  }
  ${from.desktop} {
    margin-bottom: 15px;
  }
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

type Props = {
  logoOverride?: React.ReactNode;
  cssOverrides?: SerializedStyles;
};

export const Header = ({ logoOverride, cssOverrides }: Props) => (
  <header id="top" css={[backgroundColor, cssOverrides]}>
    <div css={[gridRow, marginStyles]}>
      <div css={[manualRow(1, headerSpanDefinition), headerGridRightToLeft]}>
        {logoOverride ? logoOverride : <Logo />}
      </div>
    </div>
  </header>
);
