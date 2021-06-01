import React, { FunctionComponent } from 'react';
import { brand } from '@guardian/src-foundations/palette';
import { css, SerializedStyles } from '@emotion/react';
import { space } from '@guardian/src-foundations';
import { gridRow } from '@/client/styles/Grid';
import { from } from '@guardian/src-foundations/mq';

export const CONSENTS_MAIN_COLOR = '#eaf1fd';

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
