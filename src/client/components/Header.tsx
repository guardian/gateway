import React from 'react';
import { css } from '@emotion/react';
import { brand, space } from '@guardian/src-foundations';

import { SvgGuardianLogo } from '@guardian/src-brand';
import { Link } from '@guardian/src-link';
import { from } from '@guardian/src-foundations/mq';
import { Container } from '@guardian/src-layout';

const GuardianLogo = () => {
  return (
    <Link
      href="https://www.theguardian.com"
      title="The Guardian Homepage"
      subdued={true}
      cssOverrides={css`
        svg {
          fill: currentColor;
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

const headerStyles = css`
  padding: ${space[1]}px ${space[3]}px;
  background-color: ${brand[400]};
`;

const containerStyles = css`
  display: flex;
  justify-content: flex-end;
`;

const svgOverrides = css`
  svg {
    height: 70px;
  }
  ${from.tablet} {
    svg {
      height: 92px;
    }
  }
  ${from.desktop} {
    svg {
      height: 117px;
    }
  }
`;

export const Header = () => (
  <header id="top" css={headerStyles}>
    <Container cssOverrides={[containerStyles, svgOverrides]}>
      <GuardianLogo />
    </Container>
  </header>
);
