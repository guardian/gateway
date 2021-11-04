import React, { FunctionComponent } from 'react';
import { css } from '@emotion/react';
import { space, text } from '@guardian/src-foundations';
import { textSans } from '@guardian/src-foundations/typography';

const mainBodyTextStyles = css`
  margin-top: 0;
  margin-bottom: ${space[3]}px;
  ${textSans.medium({ lineHeight: 'regular' })}
  font-size: 17px;
  color: ${text.primary};
`;

export const MainBodyText: FunctionComponent = ({ children }) => (
  <p css={mainBodyTextStyles}>{children}</p>
);
