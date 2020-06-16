import React, { FunctionComponent } from 'react';
import { css } from '@emotion/core';
import { neutral } from '@guardian/src-foundations';
import { headline } from '@guardian/src-foundations/typography';

const header = css`
  border-top: 1px solid ${neutral[86]};
  width: 100%;
`;

const h2 = css`
  margin: 0;
  ${headline.small({ fontWeight: 'bold', lineHeight: 'tight' })}
`;

export const PageHeader: FunctionComponent = ({ children }) => (
  <div css={header}>
    <h2 css={h2}>{children}</h2>
  </div>
);
