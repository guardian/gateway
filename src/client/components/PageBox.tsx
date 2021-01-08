import React, { FunctionComponent } from 'react';
import { css } from '@emotion/react';

export const pageBox = css`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: start;
  width: 100%;
`;

export const PageBox: FunctionComponent = ({ children }) => (
  <div css={pageBox}>{children}</div>
);
