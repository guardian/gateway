import React from 'react';
import { css } from '@emotion/core';
import { space, error, neutral } from '@guardian/src-foundations';
import { textSans } from '@guardian/src-foundations/typography';

interface ErrorMessageProps {
  error: string;
}

const errorDiv = css`
  padding: ${space[2]}px ${space[3]}px;
  background-color: ${error[400]};
`;

const errorP = css`
  margin: 0;
  color: ${neutral[100]};
  ${textSans.medium()}
`;

export const ErrorMessage = ({ error }: ErrorMessageProps) => (
  <div css={errorDiv}>
    <p css={errorP}>{error}</p>
  </div>
);
