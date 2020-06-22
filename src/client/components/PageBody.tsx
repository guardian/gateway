import React, { FunctionComponent } from 'react';
import { css } from '@emotion/core';
import { space } from '@guardian/src-foundations';
import { MinWidth } from '@/client/models/Style';

const pageBody = css`
  padding: ${space[3]}px 0;
  max-width: ${MinWidth.TABLET}px;
  width: 100%;
`;

export const PageBody: FunctionComponent = ({ children }) => (
  <div css={pageBody}>{children}</div>
);
