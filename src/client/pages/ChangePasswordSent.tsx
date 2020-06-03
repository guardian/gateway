import React from 'react';
import { css } from '@emotion/core';
import { space } from '@guardian/src-foundations';
import { headline } from '@guardian/src-foundations/typography';
import { from } from '@guardian/src-foundations/mq';

const h1 = css`
  margin: 0;
  padding: ${space[2]}px ${space[3]}px;
  ${headline.small()}

  ${from.tablet} {
    ${headline.large()}
  }
`;

export const ChangePasswordSentPage = () => {
  return (
    <>
      <h1 css={h1}>Thank you! Your password has been changed.</h1>
    </>
  );
};
