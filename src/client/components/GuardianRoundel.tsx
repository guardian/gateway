import React from 'react';
import { css } from '@emotion/core';
import { SvgRoundelBrandInverse } from '@guardian/src-brand';
import { Link } from '@guardian/src-link';

export const GuardianRoundel = () => {
  return (
    <div
      css={css`
        height: 42px;
        width: 42px;
      `}
    >
      <Link
        href="https://www.theguardian.com"
        title="The Guardian Homepage"
        subdued
      >
        <SvgRoundelBrandInverse />
      </Link>
    </div>
  );
};
