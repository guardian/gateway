import React from 'react';
import { css } from '@emotion/react';
import { brand, space } from '@guardian/src-foundations';

import { SvgGuardianLogo } from '@guardian/src-brand';
import { Link } from '@guardian/src-link';
import { from } from '@guardian/src-foundations/mq';
import { Container } from '@/client/components/Container';

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
      wadfaw
      <SvgGuardianLogo />
    </Link>
  );
};

const headerStyles = css`
  padding: ${space[1]}px ${space[3]}px;
  background-color: ${brand[400]};
`;

const wrapperStyles = css`
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
    <Container>
      <div css={[wrapperStyles, svgOverrides]}>
        <GuardianLogo />
      </div>
    </Container>
  </header>
);
