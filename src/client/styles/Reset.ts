import { neutral } from '@guardian/src-foundations';
import { css } from '@emotion/core';
import { space } from '@guardian/src-foundations';
import { textSans, headline } from '@guardian/src-foundations/typography';
import { MinWidth } from '@/client/models/Style';

export const resetPasswordBorder = `2px solid ${neutral[86]}`;

export const resetPasswordBox = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  width: 100%;
`;

export const header = css`
  border-top: 1px solid ${neutral[86]};
  width: 100%;
`;

export const main = css`
  padding: ${space[3]}px 0;
  max-width: ${MinWidth.TABLET}px;
  width: 100%;
`;

export const h2 = css`
  margin: 0;
  ${headline.small({ fontWeight: 'bold', lineHeight: 'tight' })}
`;

export const p = css`
  margin: 0;
  ${textSans.medium({ lineHeight: 'regular' })}
`;
