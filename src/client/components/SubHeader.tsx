import * as React from 'react';
import { css } from '@emotion/react';
import {
  neutral,
  brand,
  space,
  headline,
  from,
} from '@guardian/source-foundations';
import { Container } from '@/client/components/Container';

type Props = {
  title: string;
};

const backgroundStyles = css`
  background-color: ${brand[300]};
`;

const paddingTop = css`
  padding-top: ${space[9]}px;
  ${from.tablet} {
    padding-top: ${space[12]}px;
  }
`;

const h1Styles = css`
  width: 100%;
  margin: 0;
  padding-top: ${space[1]}px;
  padding-bottom: ${space[1]}px;
  padding-right: ${space[1]}px;
  color: ${neutral[100]};

  ${headline.xsmall({ fontWeight: 'bold', lineHeight: 'tight' })}
  ${from.tablet} {
    margin: 0;
    ${headline.small({ fontWeight: 'bold', lineHeight: 'regular' })}
  }
`;

export const SubHeader = ({ title }: Props) => (
  <header css={[backgroundStyles, paddingTop]}>
    <Container topBorder={true} sideBorders={true}>
      <h1 css={[h1Styles]}>{title}</h1>
    </Container>
  </header>
);
