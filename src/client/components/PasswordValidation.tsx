import React from 'react';
import {
  validationInfoCss,
  ValidationStyling,
} from '@/client/styles/PasswordValidationStyles';
import { css } from '@emotion/react';
import { SvgCheckmark } from '@guardian/src-icons';
import { palette } from '@guardian/src-foundations';
import { SvgCross } from '@guardian/src-icons';
import {
  LengthValidationResult,
  PasswordValidationShortMessage,
} from '@/shared/lib/PasswordValidation';
import { textSans } from '@guardian/src-foundations/typography';
import { ChangePasswordErrors } from '@/shared/model/Errors';

const symbolStyling = {
  [ValidationStyling.SUCCESS]: {
    color: palette.success['400'],
    symbol: <SvgCheckmark />,
  },
  [ValidationStyling.FAILURE]: {
    color: palette.neutral['7'],
    symbol: <SvgCross />,
  },
  [ValidationStyling.ERROR]: {
    color: palette.error['400'],
    symbol: <SvgCross />,
  },
};

const ValidationSymbol = ({
  validationStyling,
}: {
  validationStyling: ValidationStyling;
}) => {
  const { color, symbol } = symbolStyling[validationStyling];

  const style = css`
    display: inline-block;
    position: relative;
    top: 3px;
    svg {
      width: 16px;
      height: 16px;
      fill: ${color};
    }
  `;

  return <div css={style}>{symbol}</div>;
};

export const LengthValidationComponent = ({
  validationStyling,
  lengthResult,
}: {
  validationStyling: ValidationStyling;
  lengthResult: LengthValidationResult;
}) => {
  return (
    <div>
      <ValidationSymbol validationStyling={validationStyling} />
      <div css={validationInfoCss(validationStyling)}>
        {PasswordValidationShortMessage[lengthResult]}
      </div>
    </div>
  );
};

export const WeakPasswordComponent = () => {
  const smallStyle = css`
    ${textSans.small()}
    color: ${palette.neutral['7']};
  `;

  const redStyle = css`
    color: ${palette.error['400']};
  `;

  return (
    <div css={smallStyle}>
      <span css={[smallStyle, redStyle]}>Weak password:</span>{' '}
      {ChangePasswordErrors.COMMON_PASSWORD_SHORT}
    </div>
  );
};
