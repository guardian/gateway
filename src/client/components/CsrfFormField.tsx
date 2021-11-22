import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { css } from '@emotion/react';
import { error, space, textSans } from '@guardian/source-foundations';

const csrfErrorStyle = css`
  margin-bottom: ${space[4]}px;
  ${textSans.medium({ lineHeight: 'regular' })}
  color: ${error[400]};
  text-align: center;
`;

export const CsrfFormField = () => {
  const clientState: ClientState = useContext(ClientStateContext);

  const { pageData: { fieldErrors } = {} } = clientState;

  const csrfError = fieldErrors?.find(
    (fieldError) => fieldError.field === 'csrf',
  )?.message;

  return (
    <>
      {csrfError ? <div css={csrfErrorStyle}>{csrfError}</div> : null}
      <input type="hidden" name="_csrf" value={clientState.csrf?.token} />
      <input
        type="hidden"
        name="_csrfPageUrl"
        value={clientState.csrf?.pageUrl}
      />
    </>
  );
};
