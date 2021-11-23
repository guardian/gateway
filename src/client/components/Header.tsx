import React from 'react';
import { css } from '@emotion/react';
import { brand, from, space } from '@guardian/source-foundations';
import { Logo } from '@guardian/source-react-components-development-kitchen';
import { gridRow, manualRow, SpanDefinition } from '@/client/styles/Grid';
import { GeoLocation } from '@/shared/model/Geolocation';

interface HeaderProps {
  geolocation?: GeoLocation;
}

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

export const Header = ({ geolocation }: HeaderProps) => (
  <header id="top" css={backgroundColor}>
    <div css={[gridRow, marginStyles]}>
      <div css={[manualRow(1, headerSpanDefinition), headerGridRightToLeft]}>
        <Logo logoType={geolocation === 'GB' ? 'bestWebsite' : 'anniversary'} />
      </div>
    </div>
  </header>
);
