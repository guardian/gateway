import React from 'react';

type CmpConsentedStateProps = {
	cmpConsentedState: boolean;
};

export const CmpConsentedStateHiddenInput = ({
	cmpConsentedState,
}: CmpConsentedStateProps) => {
	return (
		<>
			<input
				type="hidden"
				name="_cmpConsentedState"
				value={`${cmpConsentedState}`}
			/>
		</>
	);
};
