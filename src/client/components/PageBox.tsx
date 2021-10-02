import React, { FunctionComponent } from 'react';
import { css } from '@emotion/react';
import { space } from '@guardian/src-foundations';
import { from } from '@guardian/src-foundations/mq';

export const pageBox = css`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: start;
  width: 100%;
  padding-top: ${space[2]}px;
  padding-bottom: 60px;
  ${from.mobileMedium} {
    padding-top: ${space[4]}px;
  }
  ${from.tablet} {
    padding-top: ${space[6]}px;
  }
`;

export const PageBox: FunctionComponent = ({ children }) => (
  <div css={pageBox}>{children}</div>
);
