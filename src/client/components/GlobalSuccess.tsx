import React from 'react';
import { css } from '@emotion/core';
import { space, success, neutral } from '@guardian/src-foundations';
import { textSans } from '@guardian/src-foundations/typography';
import { SvgTickRound } from '@guardian/src-icons';

interface GlobalSuccessProps {
  success: string;
}

const successDiv = css`
  padding: ${space[2]}px ${space[3]}px;
  background-color: ${success[400]};
  text-align: center;
`;

const successP = css`
  color: ${neutral[100]};
  margin: 0;
  ${textSans.medium()}

  svg {
    width: 30px;
    height: 30px;
    fill: currentColor;
    vertical-align: middle;
    margin-right: ${space[1]}px;
  }
`;

const svg = css`
  height: 30px;
  width: 30px;
`;

export const GlobalSuccess = ({ success }: GlobalSuccessProps) => (
  <div css={successDiv}>
    <p css={successP}>
      <SvgTickRound css={svg} />
      {success}
    </p>
  </div>
);
