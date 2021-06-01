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
