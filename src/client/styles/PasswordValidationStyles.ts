import { css } from '@emotion/core';
import validationGreenTick from '@/client/assets/svgs/validation-green-tick.svg';
import validationRedCross from '@/client/assets/svgs/validation-red-cross.svg';
import validationCross from '@/client/assets/svgs/validation-cross.svg';
import eyeOpen from '@/client/assets/svgs/eye-open.svg';
import eyeCrossed from '@/client/assets/svgs/eye-crossed.svg';

export type ValidationStyling = 'success' | 'failure' | 'error';

export const passwordValidatorsCss = css`
  margin-bottom: 10px;
`;

export const validationInfoCss = (styling: ValidationStyling) => {
  let color = '#121212';
  if (styling === 'success') {
    color = '#22874d';
  } else if (styling === 'error') {
    color = '#c70000';
  }

  return css`
    font-family: GuardianTextSans, sans-serif;
    font-style: normal;
    font-weight: normal;
    font-size: 15px;
    line-height: 135%;
    margin-bottom: 4px;
    margin-left: 3px;
    /* identical to box height, or 19px */

    letter-spacing: 0.01em;

    /* Neutral / neutral.7 */

    display: inline-block;
    color: ${color};
  `;
};

export const validationSymbol = (styling: ValidationStyling) => {
  let symbol = validationCross;
  if (styling === 'success') {
    symbol = validationGreenTick;
  } else if (styling === 'error') {
    symbol = validationRedCross;
  }

  return css`
    width: 16px;
    height: 16px;
    display: inline-block;
    position: relative;
    top: 3px;
    background-image: url('${symbol}');
  `;
};

export const eyeSymbol = css`
  width: 30px;
  height: 30px;
  position: absolute;
  right: 5px;
  top: 7px;
`;

export const openEyeSymbol = css`
  background-image: url('${eyeOpen}');
`;

export const crossedEyeSymbol = css`
  background-image: url('${eyeCrossed}');
`;
