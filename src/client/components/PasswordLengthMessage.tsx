import React from 'react';
import {
  validationInfoCss,
  ValidationStyling,
} from '@/client/styles/PasswordValidationStyles';
import { css } from '@emotion/react';
import { SvgCheckmark } from '@guardian/src-icons';
import { palette } from '@guardian/src-foundations';
import { SvgCross } from '@guardian/src-icons';
import { PasswordValidationResult } from '@/shared/lib/PasswordValidationResult';
import { ChangePasswordErrors } from '@/shared/model/Errors';

const PasswordValidationShortMessage = {
  [PasswordValidationResult.AT_LEAST_8]: ChangePasswordErrors.AT_LEAST_8_SHORT,
  [PasswordValidationResult.MAXIMUM_72]: ChangePasswordErrors.MAXIMUM_72_SHORT,
  [PasswordValidationResult.COMMON_PASSWORD]:
    ChangePasswordErrors.COMMON_PASSWORD_SHORT,
};

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

export const PasswordLengthMessage = ({
  validationStyling,
  lengthResult,
}: {
  validationStyling: ValidationStyling;
  lengthResult:
    | PasswordValidationResult.AT_LEAST_8
    | PasswordValidationResult.MAXIMUM_72;
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
