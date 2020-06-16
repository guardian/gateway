import React, { FunctionComponent } from 'react';
import { css } from '@emotion/core';

export const pageBox = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: start;
  width: 100%;
`;

export const PageBox: FunctionComponent = ({ children }) => (
  <div css={pageBox}>{children}</div>
);
