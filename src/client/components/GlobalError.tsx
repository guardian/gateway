import React from 'react';
import { css } from '@emotion/core';
import { space, error, neutral } from '@guardian/src-foundations';
import { textSans } from '@guardian/src-foundations/typography';
import { SvgAlert } from '@guardian/src-icons';
import { ErrorLink } from '@/client/lib/ErrorLink';

interface GlobalErrorProps {
  error: string;
  link: ErrorLink;
}

const errorDiv = css`
  padding: ${space[2]}px ${space[3]}px;
  background-color: ${error[400]};
  text-align: center;
`;

const errorP = css`
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

const errorLink = css`
  color: ${neutral[100]};
`;

const svg = css`
  height: 30px;
  width: 30px;
`;

export const GlobalError = ({ error, link }: GlobalErrorProps) => (
  <div css={errorDiv}>
    <p css={errorP}>
      <SvgAlert css={svg} />
      {error}
      &nbsp;
      <a css={errorLink} href={link.link}>
        {link.linkText}
      </a>
    </p>
  </div>
);
