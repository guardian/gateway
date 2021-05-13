import React, { FunctionComponent } from 'react';
import { css, SerializedStyles } from '@emotion/react';
import { brand, space } from '@guardian/src-foundations';
import { GuardianRoundel } from '@/client/components/GuardianRoundel';

interface ComponentProps {
  cssOverrides?: SerializedStyles;
}

const header = css`
  display: flex;
  justify-content: flex-end;
  padding: ${space[1]}px ${space[3]}px;
  background-color: ${brand[400]};
  flex: 0 0 auto;
`;

export const Header: FunctionComponent<ComponentProps> = ({ cssOverrides }) => (
  <header css={[header, cssOverrides]}>
    <GuardianRoundel />
  </header>
);
