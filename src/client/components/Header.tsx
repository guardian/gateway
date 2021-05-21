import React, { FunctionComponent } from 'react';
import { css, SerializedStyles } from '@emotion/react';
import { brand, space } from '@guardian/src-foundations';

import { SvgGuardianLogo } from '@guardian/src-brand';
import { Link } from '@guardian/src-link';
import { from } from '@guardian/src-foundations/mq';

interface ComponentProps {
  cssOverrides?: SerializedStyles;
}

const GuardianLogo = () => {
  return (
    <Link
      href="https://www.theguardian.com"
      title="The Guardian Homepage"
      subdued
      cssOverrides={css`
        svg {
          fill: currentColor;
        }
        width: 149px;
        margin-right: 0px;
        ${from.tablet} {
          width: 224px;
          margin-right: 20px;
        }
        ${from.desktop} {
          width: 295px;
          margin-right: 120px;
        }
        color: white;
        :hover {
          color: white;
        }
      `}
    >
      <SvgGuardianLogo />
    </Link>
  );
};

const header = css`
  display: flex;
  justify-content: flex-end;
  padding: ${space[1]}px ${space[3]}px;
  background-color: ${brand[400]};
  flex: 0 0 auto;
  height: 70px;
  ${from.tablet} {
    height: 92px;
  }
  ${from.desktop} {
    height: 117px;
  }
`;

export const Header: FunctionComponent<ComponentProps> = ({ cssOverrides }) => (
  <header css={[header, cssOverrides]}>
    <GuardianLogo />
  </header>
);
