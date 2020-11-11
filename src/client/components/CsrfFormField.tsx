import React, { useContext } from 'react';
import { GlobalState } from '@/shared/model/GlobalState';
import { GlobalStateContext } from '@/client/components/GlobalState';
import { css } from '@emotion/core';
import { error, space } from '@guardian/src-foundations';
import { textSans } from '@guardian/src-foundations/typography';

const csrfErrorStyle = css`
  margin-bottom: ${space[4]}px;
  ${textSans.medium({ lineHeight: 'regular' })}
  color: ${error[400]};
  text-align: center;
`;

export const CsrfFormField = () => {
  const globalState: GlobalState = useContext(GlobalStateContext);

  const { pageData: { fieldErrors } = {} } = globalState;

  const csrfError = fieldErrors?.find(
    (fieldError) => fieldError.field === 'csrf',
  )?.message;

  return (
    <>
      {csrfError ? <div css={csrfErrorStyle}>{csrfError}</div> : null}
      <input type="hidden" name="_csrf" value={globalState.csrf?.token} />
      <input
        type="hidden"
        name="_csrfPageUrl"
        value={globalState.csrf?.pageUrl}
      />
    </>
  );
};
