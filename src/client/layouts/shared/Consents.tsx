import React, { FunctionComponent } from 'react';
import { from, neutral, space } from '@guardian/source-foundations';
import { css, SerializedStyles } from '@emotion/react';
import { gridRow } from '@/client/styles/Grid';

const greyBorder = css`
  margin: 0 auto;

  ${from.tablet} {
    border-left: 1px solid ${neutral[86]};
    border-right: 1px solid ${neutral[86]};
  }
`;

const content = css`
  ${gridRow}
  background-color: white;
  width: 100%;
  padding-bottom: 22px;
  ${greyBorder}
`;

export const controls = css`
  padding: 0 0 64px 0;
  ${from.tablet} {
    padding: 0 0 ${space[24]}px 0;
  }
`;

export const ConsentsContent: FunctionComponent<{
  cssOverrides?: SerializedStyles;
}> = ({ children, cssOverrides }) => (
  <div css={[content, cssOverrides]}>{children}</div>
);
