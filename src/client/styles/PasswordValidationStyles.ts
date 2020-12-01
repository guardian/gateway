import { css } from '@emotion/core';
import { palette } from '@guardian/src-foundations';
import { textSans } from '@guardian/src-foundations/typography';

export enum ValidationStyling {
  SUCCESS,
  FAILURE,
  ERROR,
}

export const validationInfoCss = (styling: ValidationStyling) => {
  let color = palette.neutral['7'];

  if (styling === ValidationStyling.SUCCESS) {
    color = palette.success['400'];
  } else if (styling === ValidationStyling.ERROR) {
    color = palette.error['400'];
  }

  return css`
    ${textSans.small()}
    margin-bottom: 4px;
    margin-left: 3px;
    display: inline-block;
    color: ${color};
  `;
};
