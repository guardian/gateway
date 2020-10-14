import React from 'react';
import {
  passwordValidatorsCss,
  validationInfoCss,
  ValidationStyling,
} from '@/client/styles/PasswordValidationStyles';
import { css } from '@emotion/core';
import { SvgCheckmark } from '@guardian/src-icons';
import { palette } from '@guardian/src-foundations';
import { SvgCross } from '@guardian/src-icons';
import {
  passwordValidation,
  PasswordValidationText,
} from '@/shared/lib/PasswordValidation';

export type PasswordValidationProps = {
  password: string;
  passwordRepeated: string;
  hasFailedToSubmit: boolean;
};

const ValidationSymbol = ({
  validationStyling,
}: {
  validationStyling: ValidationStyling;
}) => {
  let fillColour = palette.neutral['7'];
  let symbol = <SvgCross />;

  if (validationStyling === 'success') {
    fillColour = palette.success['400'];
    symbol = <SvgCheckmark />;
  } else if (validationStyling === 'error') {
    fillColour = palette.error['400'];
  }

  const style = css`
    display: inline-block;
    position: relative;
    top: 3px;
    svg {
      width: 16px;
      height: 16px;
      fill: ${fillColour};
    }
  `;

  return <div css={style}>{symbol}</div>;
};

export const PasswordValidationComponent = (props: PasswordValidationProps) => {
  let lengthValidationText = PasswordValidationText.AT_LEAST_6;
  const failureStyling: ValidationStyling = props.hasFailedToSubmit
    ? 'error'
    : 'failure';

  let lengthValidationStyling: ValidationStyling = failureStyling;
  let upperAndLowercaseValidationStyling: ValidationStyling = failureStyling;
  let symbolValidationStyling: ValidationStyling = failureStyling;
  let matchingStyling: ValidationStyling = failureStyling;

  const {
    sixOrMore,
    lessThan72,
    upperAndLowercase,
    symbolOrNumber,
    matching,
  } = passwordValidation(props.password, props.passwordRepeated);

  if (sixOrMore) lengthValidationStyling = 'success';
  if (!lessThan72) {
    lengthValidationStyling = failureStyling;
    lengthValidationText = PasswordValidationText.UP_TO_72;
  }
  if (upperAndLowercase) upperAndLowercaseValidationStyling = 'success';
  if (symbolOrNumber) symbolValidationStyling = 'success';
  if (matching) matchingStyling = 'success';

  return (
    <div css={passwordValidatorsCss}>
      <div>
        <ValidationSymbol validationStyling={lengthValidationStyling} />
        <div css={validationInfoCss(lengthValidationStyling)}>
          {lengthValidationText}
        </div>
      </div>
      <div>
        <ValidationSymbol
          validationStyling={upperAndLowercaseValidationStyling}
        />
        <div css={validationInfoCss(upperAndLowercaseValidationStyling)}>
          {PasswordValidationText.MIXTURE_OF_CASES}
        </div>
      </div>
      <div>
        <ValidationSymbol validationStyling={symbolValidationStyling} />
        <div css={validationInfoCss(symbolValidationStyling)}>
          {PasswordValidationText.SYMBOL_OR_NUMBER}
        </div>
      </div>
      <div>
        <ValidationSymbol validationStyling={matchingStyling} />
        <div css={validationInfoCss(matchingStyling)}>
          {PasswordValidationText.MATCHING_REPEATED}
        </div>
      </div>
    </div>
  );
};
