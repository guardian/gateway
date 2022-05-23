import React from 'react';
import { css } from '@emotion/react';
import { LogoProps } from '@guardian/source-react-components-development-kitchen';
import { from, visuallyHidden } from '@guardian/source-foundations';
import jobsLogo from '@/client/assets/jobs/jobs-logo.png';

const imgSize = css`
  width: 232px;
  height: auto;
  ${from.mobileMedium} {
    width: 306px;
  }
  ${from.desktop} {
    width: 375px;
  }
`;

const logoStyles = css`
  /* Adding block display here so that the focus halo correctly covers the content */
  display: block;
`;

export const JobsLogo = ({ cssOverrides }: LogoProps) => (
  <a
    href="https://jobs.theguardian.com/"
    title="Guardian Jobs"
    css={[logoStyles, cssOverrides]}
  >
    <span
      css={css`
        ${visuallyHidden};
      `}
    >
      The Guardian Jobs - Back to home
    </span>
    <>
      <img
        src={jobsLogo}
        alt="The Guardian Jobs logo"
        css={[imgSize, logoStyles]}
      />
    </>
  </a>
);
