import React from 'react';
import {
  validationInfoCss,
  ValidationStyling,
} from '@/client/styles/PasswordValidationStyles';
import { css } from '@emotion/core';
import { SvgCheckmark } from '@guardian/src-icons';
import { palette, space } from '@guardian/src-foundations';
import { SvgCross } from '@guardian/src-icons';
import {
  passwordValidation,
  PasswordValidationText,
} from '@/shared/lib/PasswordValidation';

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

export const PasswordValidationComponent = (props: {
  password: string;
  showRedValidationErrors: boolean;
}) => {
  let lengthValidationText = PasswordValidationText.AT_LEAST_6;
  const failureStyling: ValidationStyling = props.showRedValidationErrors
    ? 'error'
    : 'failure';

  let lengthValidationStyling: ValidationStyling = failureStyling;
  let upperAndLowercaseValidationStyling: ValidationStyling = failureStyling;
  let symbolValidationStyling: ValidationStyling = failureStyling;

  const {
    sixOrMore,
    lessThan72,
    upperAndLowercase,
    symbolOrNumber,
  } = passwordValidation(props.password);

  if (sixOrMore) lengthValidationStyling = 'success';
  if (!lessThan72) {
    lengthValidationStyling = failureStyling;
    lengthValidationText = PasswordValidationText.UP_TO_72;
  }
  if (upperAndLowercase) upperAndLowercaseValidationStyling = 'success';
  if (symbolOrNumber) symbolValidationStyling = 'success';

  return (
    <div
      css={css`
        margin-bottom: ${space[9]}px;
      `}
    >
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
    </div>
  );
};

export const PasswordMatchingValidationComponent = ({
  password,
  passwordRepeated,
  display,
}: {
  password: string;
  passwordRepeated: string;
  display: boolean;
}) => {
  const matchingStyling: ValidationStyling =
    password === passwordRepeated ? 'success' : 'error';

  const style = css`
    margin-bottom: ${space[3]}px;
    visibility: ${display ? 'visible' : 'hidden'};
  `;

  return (
    <div css={style}>
      <ValidationSymbol validationStyling={matchingStyling} />
      <div css={validationInfoCss(matchingStyling)}>
        {PasswordValidationText.MATCHING_REPEATED}
      </div>
    </div>
  );
};
