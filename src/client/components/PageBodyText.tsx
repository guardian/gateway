import React, { FunctionComponent } from 'react';
import { css } from '@emotion/core';
import { space } from '@guardian/src-foundations';
import { textSans } from '@guardian/src-foundations/typography';

const pageBodyText = css`
  margin-top: 0;
  margin-bottom: ${space[2]}px;
  ${textSans.medium({ lineHeight: 'regular' })}
`;

export const PageBodyText: FunctionComponent = ({ children }) => (
  <p css={pageBodyText}>{children}</p>
);
