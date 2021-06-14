import * as React from 'react';
import { css } from '@emotion/react';
import { neutral, brand, space, brandLine } from '@guardian/src-foundations';
import { headline } from '@guardian/src-foundations/typography';
import { Container } from '@guardian/src-layout';
import { from } from '@guardian/src-foundations/mq';

type Props = {
  title: string;
};

const backgroundStyles = css`
  background-color: ${brand[300]};
`;

const paddingTop = css`
  ${from.mobileMedium} {
    padding-top: ${space[12]}px;
  }
  ${from.tablet} {
    padding-top: ${space[24]}px;
  }
  ${from.desktop} {
    padding-top: calc(${space[24]}px + ${space[6]}px);
  }
`;

// TODO: Remove these once https://github.com/guardian/source/pull/820 is merged and published
//       after which we can use `topBorder` and `borderColor` instead.
const borderOverrides = css`
  border-top-width: 1px !important;
  border-top-color: ${brandLine.primary} !important;
  border-left-color: ${brandLine.primary} !important;
  border-right-color: ${brandLine.primary} !important;
  border-top-style: solid !important;
`;

const paddingLeftOverrides = css`
  padding-left: 0 !important;
`;

const h1Styles = css`
  width: 100%;
  margin: 0;
  padding-top: ${space[1]}px;
  padding-bottom: ${space[1]}px;
  padding-right: ${space[1]}px;
  padding-left: ${space[3]}px;
  ${from.tablet} {
    padding-left: 20px;
  }
  color: ${neutral[100]};

  ${headline.xsmall({ fontWeight: 'bold', lineHeight: 'tight' })}
  ${from.tablet} {
    margin: 0;
    ${headline.large({ fontWeight: 'bold', lineHeight: 'regular' })}
  }
`;

const paddingStyles = css`
  padding-top: ${space[1]}px;
  padding-bottom: ${space[1]}px;
  padding-right: ${space[1]}px;
  padding-left: ${space[3]}px;
  ${from.tablet} {
    padding-left: 20px;
  }
`;

export const SubHeader = ({ title }: Props) => (
  <header css={[backgroundStyles, paddingTop]}>
    <Container
      border={true}
      cssOverrides={[borderOverrides, paddingLeftOverrides]}
    >
      <h1 css={[h1Styles, paddingStyles]}>{title}</h1>
    </Container>
  </header>
);
