import * as React from 'react';
import { css } from '@emotion/core';
import { brand, space } from '@guardian/src-foundations';
import { GuardianRoundel } from '@/client/components/GuardianRoundel';

const header = css`
  display: flex;
  justify-content: flex-end;
  padding: ${space[1]}px ${space[3]}px;
  background-color: ${brand[400]};
`;

export const Header = () => (
  <header css={header}>
    <GuardianRoundel />
  </header>
);
