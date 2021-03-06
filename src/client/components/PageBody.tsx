import React, { FunctionComponent } from 'react';
import { css } from '@emotion/react';
import { space } from '@guardian/src-foundations';
import { Breakpoints } from '@/client/models/Style';

const pageBody = css`
  padding: ${space[3]}px 0;
  max-width: ${Breakpoints.MOBILE_LANDSCAPE}px;
  width: 100%;
`;

export const PageBody: FunctionComponent = ({ children }) => (
  <div css={pageBody}>{children}</div>
);
