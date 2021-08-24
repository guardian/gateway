import React from 'react';
import { css } from '@emotion/react';
import { space, success, neutral } from '@guardian/src-foundations';
import { textSans } from '@guardian/src-foundations/typography';
import { SvgTickRound } from '@guardian/src-icons';
import {
  COLUMNS,
  gridItem,
  gridItemColumnConsents,
  gridRow,
} from '@/client/styles/Grid';

interface GlobalSuccessProps {
  success: string;
}

const containerStyles = css`
  padding: ${space[2]}px 0;
  background-color: ${success[400]};
  width: 100%;
  text-align: center;
`;

const textStyles = css`
  display: flex;
  justify-content: left;
  text-align: left;
  color: ${neutral[100]};
  margin: 0;
  ${textSans.medium()}
`;

const svgStyles = css`
  svg {
    flex: 0 0 auto;
    width: 30px;
    height: 30px;
    fill: currentColor;
    vertical-align: middle;
    margin-right: ${space[1]}px;
  }
`;

const gridStyles = gridItem({
  ...gridItemColumnConsents,
  ...{ WIDE: { start: 1, span: COLUMNS.WIDE } },
});

const rowStyles = css`
  ${gridRow}
  margin: 0 auto;
`;

export const GlobalSuccess = ({ success }: GlobalSuccessProps) => {
  return (
    <div css={containerStyles} role="complementary">
      <div css={rowStyles}>
        <p css={[textStyles, svgStyles, gridStyles]}>
          <SvgTickRound />
          <div>{success}</div>
        </p>
      </div>
    </div>
  );
};
