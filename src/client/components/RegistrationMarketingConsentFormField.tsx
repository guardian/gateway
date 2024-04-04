import { css } from '@emotion/react';
import { palette, space, textSans } from '@guardian/source-foundations';
import React from 'react';
import { ToggleSwitchInput } from '@/client/components/ToggleSwitchInput';

const switchRow = css`
	border: 0;
	padding: 0;
	margin: 0;
	${textSans.medium()}
	border-radius: 4px;
	border: 1px solid ${palette.neutral[38]};
	padding: ${space[2]}px;
`;

const labelStyles = css`
	justify-content: space-between;
	color: ${palette.neutral[46]};
	${textSans.xsmall()}
`;

type Props = {
	id: string;
	label: string;
};

export const RegistrationMarketingConsentFormField = ({ id, label }: Props) => {
	return (
		<>
			<fieldset css={switchRow}>
				<ToggleSwitchInput
					id={id}
					label={label}
					defaultChecked={true}
					cssOverrides={labelStyles}
				/>
			</fieldset>
		</>
	);
};
