import React, { FunctionComponent } from 'react';
import { brand } from '@guardian/src-foundations/palette';
import { css, SerializedStyles } from '@emotion/react';
import { space } from '@guardian/src-foundations';
import { gridRow } from '@/client/styles/Grid';
import { from } from '@guardian/src-foundations/mq';
import { GlobalError } from '@/client/components/GlobalError';
import { GlobalSuccess } from '@/client/components/GlobalSuccess';
import { Header } from '@/client/components/Header';
import { getErrorLink } from '@/client/lib/ErrorLink';

export const CONSENTS_MAIN_COLOR = '#eaf1fd';

export const consentsBackground = css`
  background-color: ${CONSENTS_MAIN_COLOR};
`;

export const mainBackground = css`
  position: relative;
  z-index: 0;
  &:before {
    content: ' ';
    background-color: ${brand[400]};
    opacity: 0.8;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: -1;
  }
`;

// fixes overlapping text issue in IE
// derived from this solution https://stackoverflow.com/a/49368815
export const ieFlexFix = css`
  flex: 0 0 auto;
`;

export const headerContainer = css`
  background-color: ${brand[400]};
`;

const blueBorder = css`
  margin: 0 auto;

  ${from.tablet} {
    border-left: 1px solid ${brand[400]};
    border-right: 1px solid ${brand[400]};
  }
`;

const content = css`
  ${gridRow}

  background-color: white;
  width: 100%;
  padding-top: ${space[6]}px;
  padding-bottom: ${space[6]}px;
  ${blueBorder}
`;

const flex = css`
  flex: 1 1 auto;
`;

const height100 = css`
  height: 100%;
`;

export const controls = css`
  padding: ${space[5]}px 0 ${space[24]}px 0;
  ${from.tablet} {
    padding: ${space[9]}px 0 ${space[12]}px 0;
  }
  ${from.desktop} {
    padding: ${space[9]}px 0 ${space[24]}px 0;
  }
`;

export const ConsentsContent: FunctionComponent<{
  cssOverrides?: SerializedStyles;
}> = ({ children, cssOverrides }) => (
  <div css={[content, cssOverrides]}>{children}</div>
);

export const ConsentsBlueBackground: FunctionComponent<{
  cssOverrides?: SerializedStyles;
}> = ({ children, cssOverrides }) => (
  <div css={[consentsBackground, flex, cssOverrides]}>
    <div css={[gridRow, blueBorder, height100]}>{children}</div>
  </div>
);

export const ConsentsHeader: FunctionComponent<{
  error?: string;
  success?: string;
}> = ({ error, success }) => (
  <div css={headerContainer}>
    <Header />
    {error && <GlobalError error={error} link={getErrorLink(error)} left />}
    {success && <GlobalSuccess success={success} />}
  </div>
);
