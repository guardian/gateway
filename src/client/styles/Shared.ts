import { css } from '@emotion/core';
import { from } from '@guardian/src-foundations/mq';
import { space } from '@guardian/src-foundations';

export const linkButton = css`
  width: 100%;

  ${from.mobileMedium} {
    width: max-content;
  }
`;

export const button = css`
  width: 100%;

  ${from.mobileMedium} {
    width: max-content;
  }
`;

export const textInput = css`
  margin-bottom: ${space[3]}px;
`;

export const form = css`
  padding: ${space[2]}px 0px;
`;

export const gridRowBreakpoints: (
  | 'mobile'
  | 'tablet'
  | 'desktop'
  | 'wide'
  | 'leftCol'
)[] = ['mobile', 'tablet', 'desktop', 'wide'];

export const gridItemSpansFullWidth = [4, 12, 12, 16];

export const mainGridRow = css`
  margin: 0 auto;
  background-color: #fff;

  &:first-of-type {
    padding-top: ${space[6]}px;
  }

  &:last-of-type {
    padding-bottom: ${space[3]}px;
  }
`;
