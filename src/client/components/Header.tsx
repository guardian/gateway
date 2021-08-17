import React from 'react';
import { css } from '@emotion/react';
import { brand, space } from '@guardian/src-foundations';
import { from } from '@guardian/src-foundations/mq';
import { Container } from '@/client/components/Container';
import { Logo } from '@/client/components/Logo';

type Props = {
  isAnniversary?: boolean;
};

const floatRight = css`
  /** 
    If you're here wanting to add more items to the Header then consider
    removing this and using flex for positioning instead
  */
  float: right;
`;

const bottomMarginStyles = css`
  ${from.desktop} {
    margin-bottom: ${space[4]}px;
  }
`;

const topMarginStyles = css`
  ${from.desktop} {
    margin-top: ${space[3]}px;
  }
`;

const rightMarginStyles = css`
  margin-right: ${space[3]}px;
  ${from.mobileLandscape} {
    margin-right: ${space[5]}px;
  }
  ${from.wide} {
    margin-right: ${space[24]}px;
  }
`;

const backgroundColor = css`
  background-color: ${brand[400]};
`;

export const Header = ({ isAnniversary }: Props) => (
  <header id="top" css={backgroundColor}>
    <Container sidePadding={false}>
      <div
        css={[
          floatRight,
          topMarginStyles,
          rightMarginStyles,
          bottomMarginStyles,
        ]}
      >
        <Logo isAnniversary={isAnniversary} />
      </div>
    </Container>
  </header>
);
