import { neutral } from '@guardian/src-foundations';
import { css } from '@emotion/core';
import { MinWidth } from '@/client/models/Style';
import { space, brandAlt } from '@guardian/src-foundations';
import { textSans } from '@guardian/src-foundations/typography';

export const resetPasswordBorder = `2px solid ${neutral[86]}`;

export const resetPasswordBox = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: ${MinWidth.MOBILE}px;
`;

export const header = css`
  background-color: ${brandAlt[400]};
  padding: ${space[2]}px ${space[3]}px;
  border: 2px solid transparent;
  width: 100%;
`;

export const main = css`
  padding: ${space[3]}px ${space[3]}px;
  border: ${resetPasswordBorder};
  width: 100%;
`;

export const pHeader = css`
  margin: 0;
  ${textSans.medium({ fontWeight: 'bold', lineHeight: 'regular' })}
`;

export const pMain = css`
  margin: 0;
  ${textSans.medium({ lineHeight: 'regular' })}
`;
