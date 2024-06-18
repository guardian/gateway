import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { css } from '@emotion/react';
import { error, remSpace, textSans } from '@guardian/source/foundations';

const csrfErrorStyle = css`
	margin-bottom: ${remSpace[4]};
	${textSans.medium({ lineHeight: 'regular' })}
	color: ${error[400]};
	text-align: center;
`;

export const CsrfFormField = () => {
	const clientState = useClientState();

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
