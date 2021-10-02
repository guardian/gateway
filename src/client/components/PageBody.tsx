import React, { FunctionComponent } from 'react';
import { css } from '@emotion/react';
import { Breakpoints } from '@/client/models/Style';

const pageBody = css`
  max-width: ${Breakpoints.MOBILE_LANDSCAPE}px;
  width: 100%;
`;

export const PageBody: FunctionComponent = ({ children }) => (
  <div css={pageBody}>{children}</div>
);
