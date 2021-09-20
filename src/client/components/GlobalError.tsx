import React from 'react';
import { css } from '@emotion/react';
import { space, error, neutral } from '@guardian/src-foundations';
import { textSans } from '@guardian/src-foundations/typography';
import { SvgAlertTriangle } from '@guardian/src-icons';
import { ErrorLink } from '@/client/lib/ErrorLink';
import {
  gridItem,
  gridItemColumnConsents,
  gridRow,
  COLUMNS,
} from '@/client/styles/Grid';
import { Link } from '@guardian/src-link';

interface GlobalErrorProps {
  error: string;
  link: ErrorLink;
  left?: boolean;
}

const textColour = css`
  color: ${neutral[100]};
`;

const errorDiv = (addSidePadding: boolean) => css`
  padding: ${space[2]}px ${addSidePadding ? space[3] : 0}px;
  background-color: ${error[400]};
  width: 100%;
  text-align: center;
`;

const errorP = (left = false) => css`
  display: flex;
  justify-content: ${left ? 'left' : 'center'};
  text-align: left;
  margin: 0;
  ${textColour}
  ${textSans.medium()}

  svg {
    flex: 0 0 auto;
    width: 30px;
    height: 30px;
    fill: currentColor;
    vertical-align: middle;
    margin-right: ${space[1]}px;
  }
`;

const errorLink = css`
  ${textColour}

  :hover {
    ${textColour}
  }
`;

export const GlobalError = ({ error, link, left }: GlobalErrorProps) => {
  const row = left
    ? css`
        ${gridRow}
        margin: 0 auto;
      `
    : null;
  const item = left
    ? gridItem({
        ...gridItemColumnConsents,
        TABLET: { start: 0, span: COLUMNS.TABLET },
        DESKTOP: { start: 2, span: COLUMNS.DESKTOP },
        WIDE: { start: 4, span: COLUMNS.TABLET },
      })
    : null;
  return (
    <div css={errorDiv(!left)} role="complementary">
      <div css={row}>
        <div css={[errorP(left), item]}>
          <SvgAlertTriangle />
          <div>
            {error}
            &nbsp;
            <Link href={link.link} css={errorLink} subdued={true}>
              {link.linkText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
