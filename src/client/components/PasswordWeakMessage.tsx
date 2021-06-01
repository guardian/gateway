import React from 'react';
import { css } from '@emotion/react';
import { palette } from '@guardian/src-foundations';
import { textSans } from '@guardian/src-foundations/typography';
import { ChangePasswordErrors } from '@/shared/model/Errors';

export const PasswordWeakMessage = () => {
  const smallStyle = css`
    ${textSans.small()}
    color: ${palette.neutral['7']};
  `;

  const redStyle = css`
    color: ${palette.error['400']};
  `;

  return (
    <div css={smallStyle}>
      <span css={[smallStyle, redStyle]}>Weak password:</span>{' '}
      {ChangePasswordErrors.COMMON_PASSWORD_SHORT}
    </div>
  );
};
