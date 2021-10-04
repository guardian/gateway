import React from 'react';
import { gridRow, gridItem, SpanDefinition } from '@/client/styles/Grid';
import { css } from '@emotion/react';
import { space } from '@guardian/src-foundations';
import { from } from '@guardian/src-foundations/mq';

type Props = {
  children: React.ReactNode;
  gridSpanDefinition?: SpanDefinition;
};

const mainStyle = css`
  margin: 0 auto;
`;

const sectionStyle = css`
  margin-top: ${space[2]}px;
  ${from.mobileMedium} {
    margin-top: ${space[4]}px;
  }
  ${from.tablet} {
    margin-top: ${space[6]}px;
  }
`;

export const MainGrid = ({ children, gridSpanDefinition }: Props) => {
  return (
    <main css={[gridRow, mainStyle]}>
      <section css={[sectionStyle, gridItem(gridSpanDefinition)]}>
        {children}
      </section>
    </main>
  );
};
