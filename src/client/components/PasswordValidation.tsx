import React from 'react';
import {
  passwordValidatorsCss,
  validationInfoCss,
  ValidationStyling,
  validationSymbol,
} from '@/client/styles/PasswordValidationStyles';
import { isBrowser, isNode } from '@/shared/lib/isNode';

const sixCharactersRegex = /^.{6,}$/;
const lessThan72CharactersRegex = /^.{0,71}$/;
const upperAndLowercaseRegex = /[a-z].*[A-Z]|[A-Z].*[a-z]/;
const symbolOrNumberRegex = /[^a-zA-Z]/;

const atLeastSixText = 'At least 6 characters';
const upTo72CharactersText = 'Up to 72 characters';
const symbolOrNumberText = 'A symbol or a number';
const mixtureOfCaseText = 'A mixture of lower and upper case letters';
const matchingText = 'A matching repeated password';

const multipleErrorsText =
  "This password isn't valid. Please make sure it matches the required criteria";
const singleErrorPrefix = "This password isn't valid. Please include";

type PasswordMatch = {
  matchesPassword: boolean;
  description: string;
};

type PasswordMatches = {
  sixOrMore: PasswordMatch;
  lessThan72: PasswordMatch;
  upperAndLowercase: PasswordMatch;
  symbolOrNumber: PasswordMatch;
  matching: PasswordMatch;
};

const matchPassword = (
  password: string,
  passwordRepeated: string,
): PasswordMatches => {
  return {
    sixOrMore: {
      matchesPassword: !!password.match(sixCharactersRegex),
      description: atLeastSixText,
    },
    lessThan72: {
      matchesPassword: !!password.match(lessThan72CharactersRegex),
      description: upTo72CharactersText,
    },
    upperAndLowercase: {
      matchesPassword: !!password.match(upperAndLowercaseRegex),
      description: mixtureOfCaseText,
    },
    symbolOrNumber: {
      matchesPassword: !!password.match(symbolOrNumberRegex),
      description: symbolOrNumberText,
    },
    matching: {
      matchesPassword: password !== '' && password === passwordRepeated,
      description: matchingText,
    },
  };
};

export type ValidationResult = {
  sixOrMore: boolean;
  lessThan72: boolean;
  upperAndLowercase: boolean;
  symbolOrNumber: boolean;
  matching: boolean;
  failedMessage?: string;
};

export const passwordValidation = (
  password: string,
  passwordRepeated: string,
): ValidationResult => {
  let errorCount = 0;
  let failedMessage: string | undefined;
  let informationMessage: string | undefined;
  const passwordMatches = matchPassword(password, passwordRepeated);

  Object.values(passwordMatches).forEach((matcher) => {
    if (!matcher.matchesPassword) {
      errorCount += 1;
      informationMessage = matcher.description;
    }
  });

  if (errorCount === 1) {
    failedMessage = `${singleErrorPrefix} ${informationMessage?.toLowerCase()}.`;
  } else if (errorCount > 1) {
    failedMessage = multipleErrorsText;
  }

  return {
    sixOrMore: passwordMatches.sixOrMore.matchesPassword,
    lessThan72: passwordMatches.lessThan72.matchesPassword,
    upperAndLowercase: passwordMatches.upperAndLowercase.matchesPassword,
    symbolOrNumber: passwordMatches.symbolOrNumber.matchesPassword,
    matching: passwordMatches.matching.matchesPassword,
    failedMessage,
  };
};

export type PasswordValidationProps = {
  password: string;
  passwordRepeated: string;
  hasFailedToSubmit: boolean;
};

export const PasswordValidationComponent = (props: PasswordValidationProps) => {
  let lengthValidationText = atLeastSixText;
  const failureStyling: ValidationStyling =
    props.hasFailedToSubmit && isBrowser ? 'error' : 'failure';

  let lengthValidationStyling: ValidationStyling = failureStyling;
  let upperAndLowercaseValidationStyling: ValidationStyling = failureStyling;
  let symbolValidationStyling: ValidationStyling = failureStyling;
  let matchingStyling: ValidationStyling = failureStyling;

  if (isBrowser) {
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
      lengthValidationText = upTo72CharactersText;
    }
    if (upperAndLowercase) upperAndLowercaseValidationStyling = 'success';
    if (symbolOrNumber) symbolValidationStyling = 'success';
    if (matching) matchingStyling = 'success';
  }

  return (
    <div css={passwordValidatorsCss}>
      <div>
        {!isNode ? (
          <div css={validationSymbol(lengthValidationStyling)} />
        ) : null}
        <div css={validationInfoCss(lengthValidationStyling)}>
          {lengthValidationText}
        </div>
      </div>
      <div>
        <div css={validationSymbol(upperAndLowercaseValidationStyling)} />
        <div css={validationInfoCss(upperAndLowercaseValidationStyling)}>
          {mixtureOfCaseText}
        </div>
      </div>
      <div>
        <div css={validationSymbol(symbolValidationStyling)} />
        <div css={validationInfoCss(symbolValidationStyling)}>
          {symbolOrNumberText}
        </div>
      </div>
      <div>
        <div css={validationSymbol(matchingStyling)} />
        <div css={validationInfoCss(matchingStyling)}>{matchingText}</div>
      </div>
    </div>
  );
};
