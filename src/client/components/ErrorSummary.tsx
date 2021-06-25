import React from 'react';
import { css, SerializedStyles } from '@emotion/react';
import { error, space } from '@guardian/src-foundations';
import { textSans } from '@guardian/src-foundations/typography';
import { SvgAlertTriangle } from '@guardian/src-icons';
import { size } from '@guardian/src-foundations/size';

interface ErrorSummaryProps {
  error: string;
  context?: string;
  cssOverrides?: SerializedStyles | SerializedStyles[];
}

const wrapperStyles = css`
  border: 4px solid ${error[400]};
  padding: ${space[1]}px;

  display: flex;
`;

const iconStyles = css`
  display: flex;
  flex: 0 1 auto;
  margin-top: 1px;
  svg {
    fill: ${error[400]};
    height: ${size.xsmall}px;
    width: ${size.xsmall}px;
  }
`;

const errorWrapperStyles = css`
  margin-left: ${space[1]}px;
`;

const errorStyles = css`
  ${textSans.medium({ fontWeight: 'bold' })}
  color: ${error[400]};
`;

const contextStyles = css`
  ${textSans.medium()}
`;

export const ErrorSummary = ({
  error,
  context,
  cssOverrides,
}: ErrorSummaryProps) => (
  <div css={[wrapperStyles, cssOverrides]}>
    <div css={iconStyles}>
      <SvgAlertTriangle />
    </div>
    <div css={errorWrapperStyles}>
      <div css={errorStyles}>{error}</div>
      {context && <div css={contextStyles}>{context}</div>}
    </div>
  </div>
);
