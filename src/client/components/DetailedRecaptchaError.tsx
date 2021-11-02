import React from 'react';
import { space } from '@guardian/src-foundations';
import { css } from '@emotion/react';

const errorContextSpacing = css`
  margin: 0;
  margin-top: ${space[2]}px;
`;

export const DetailedRecaptchaError = () => (
  <>
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
