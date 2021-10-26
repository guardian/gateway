import React from 'react';
import { space, error as errorColors } from '@guardian/src-foundations';
import { textSans } from '@guardian/src-foundations/typography';
import { css } from '@emotion/react';

const errorContextSpacing = css`
  margin: 0;
  margin-top: ${space[2]}px;
`;

const errorHeaderStyle = css`
  ${textSans.medium()}
  color: ${errorColors[400]};
`;

const DetailedRecaptchaError = () => (
  <>
    <a css={errorHeaderStyle} href="/">
      Report this error
    </a>

    <p css={errorContextSpacing}>
      If the problem persists please try the following:
    </p>
    <ul css={errorContextSpacing}>
      <li>Disable your browser plugins</li>
      <li>Ensure that JavaScript is enabled</li>
      <li>Update your browser</li>
    </ul>
    <p css={[errorContextSpacing, { marginBottom: `${space[3]}px` }]}>
      For further help please contact our customer service team at{' '}
      <a href="email:userhelp@theguardian.com">userhelp@theguardian.com</a>
    </p>
  </>
);

export default DetailedRecaptchaError;
