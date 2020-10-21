const sixCharactersRegex = /^.{6,}$/;
const lessThan72CharactersRegex = /^.{0,72}$/;
const upperAndLowercaseRegex = /[a-z].*[A-Z]|[A-Z].*[a-z]/;
const symbolOrNumberRegex = /[^a-zA-Z]/;

export enum PasswordValidationText {
  AT_LEAST_6 = 'At least 6 characters',
  UP_TO_72 = 'Up to 72 characters',
  SYMBOL_OR_NUMBER = 'A symbol or a number',
  MIXTURE_OF_CASES = 'A mixture of lower and upper case letters',
  MATCHING_REPEATED = 'Passwords match',
  DO_NOT_MATCH_ERROR = "The passwords don't match. Please review your password",
}

const multipleErrorsText =
  "This password isn't valid. Please make sure it matches the required criteria.";
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
};

const matchPassword = (password: string): PasswordMatches => {
  return {
    sixOrMore: {
      matchesPassword: !!password.match(sixCharactersRegex),
      description: PasswordValidationText.AT_LEAST_6,
    },
    lessThan72: {
      matchesPassword: !!password.match(lessThan72CharactersRegex),
      description: PasswordValidationText.UP_TO_72,
    },
    upperAndLowercase: {
      matchesPassword: !!password.match(upperAndLowercaseRegex),
      description: PasswordValidationText.MIXTURE_OF_CASES,
    },
    symbolOrNumber: {
      matchesPassword: !!password.match(symbolOrNumberRegex),
      description: PasswordValidationText.SYMBOL_OR_NUMBER,
    },
  };
};

export type ValidationResult = {
  sixOrMore: boolean;
  lessThan72: boolean;
  upperAndLowercase: boolean;
  symbolOrNumber: boolean;
  failedMessage?: string;
};

export const passwordValidation = (password: string): ValidationResult => {
  let failedMessage: string | undefined;

  const passwordMatches = matchPassword(password);

  const errorCount = Object.values(passwordMatches).filter(
    (passwordMatch) => !passwordMatch.matchesPassword,
  ).length;
  const informationMessage = Object.values(passwordMatches).find(
    (passwordMatch) => !passwordMatch.matchesPassword,
  )?.description;

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
    failedMessage,
  };
};
