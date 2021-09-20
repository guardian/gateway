import React, { FunctionComponent } from 'react';
import { css } from '@emotion/react';
import { headline } from '@guardian/src-foundations/typography';
import { from } from '@guardian/src-foundations/mq';

const header = css`
  width: 100%;
`;

const h2 = css`
  margin: 0;
  ${headline.xxsmall({ fontWeight: 'bold', lineHeight: 'tight' })}

  ${from.tablet} {
    ${headline.xsmall({ fontWeight: 'bold', lineHeight: 'tight' })}
  }
`;

export const PageHeader: FunctionComponent = ({ children }) => (
  <div css={header}>
    <h2 css={h2}>{children}</h2>
  </div>
);
