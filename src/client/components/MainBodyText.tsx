import React, { PropsWithChildren } from 'react';
import { css, SerializedStyles } from '@emotion/react';
import { space, text } from '@guardian/src-foundations';
import { textSans } from '@guardian/src-foundations/typography';
interface Props {
  noMargin?: boolean;
  cssOverrides?: SerializedStyles;
}

const mainBodyTextStyles = (noMargin = false) => css`
  ${textSans.medium({ lineHeight: 'regular' })}
  font-size: 17px;
  color: ${text.primary};
  margin-top: 0;

  ${noMargin
    ? css`
        margin-bottom: 0;
      `
    : css`
        margin-bottom: ${space[3]}px;
      `}
`;

export const MainBodyText = ({
  children,
  cssOverrides,
  noMargin,
}: PropsWithChildren<Props>) => (
  <p css={[mainBodyTextStyles(noMargin), cssOverrides]}>{children}</p>
);
