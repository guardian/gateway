import React from 'react';
import { brand, from } from '@guardian/source-foundations';
import { css, SerializedStyles } from '@emotion/react';
import { gridRow } from '@/client/styles/Grid';

type Props = {
  cssOverrides?: SerializedStyles;
  children: React.ReactNode;
};

const CONSENTS_MAIN_COLOR = '#eaf1fd';

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

const flex = css`
  /* Allow this element to act as flex container,
   so that children can flex */
  display: flex;
  /* Allow this element to grow to the parent flex container */
  flex: 1 1 auto;
`;

export const ConsentsBlueBackground = ({ children, cssOverrides }: Props) => (
  <div css={[consentsBackground, flex, cssOverrides]}>
    <div css={[gridRow, blueBorder]}>{children}</div>
  </div>
);
