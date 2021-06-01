import React from 'react';
import { brand } from '@guardian/src-foundations/palette';
import { css, SerializedStyles } from '@emotion/react';
import { gridRow } from '@/client/styles/Grid';
import { from } from '@guardian/src-foundations/mq';

type Props = {
  cssOverrides?: SerializedStyles;
  children: React.ReactNode;
};
export const CONSENTS_MAIN_COLOR = '#eaf1fd';

const consentsBackground = css`
  background-color: ${CONSENTS_MAIN_COLOR};
`;

const blueBorder = css`
  margin: 0 auto;

  ${from.tablet} {
    border-left: 1px solid ${brand[400]};
    border-right: 1px solid ${brand[400]};
  }
`;

const height100 = css`
  height: 100%;
`;

const flex = css`
  flex: 1 1 auto;
`;

export const ConsentsBlueBackground = ({ children, cssOverrides }: Props) => (
  <div css={[consentsBackground, flex, cssOverrides]}>
    <div css={[gridRow, blueBorder, height100]}>{children}</div>
  </div>
);
