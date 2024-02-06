import { css } from '@emotion/react';
import { palette, space, textSans } from '@guardian/source-foundations';
import { Divider } from '@guardian/source-react-components-development-kitchen';
import React from 'react';
import { divider } from '@/client/styles/Shared';
import { ToggleSwitchInput } from './ToggleSwitchInput';

const switchRow = css`
	border: 0;
	padding: 0;
	margin: ${space[6]}px ${space[2]}px 0 ${space[2]}px;
	${textSans.medium()}
`;

const labelStyles = css`
	justify-content: space-between;
	color: ${palette.neutral[46]};
	${textSans.xsmall()}
`;

const bottomDividerStyles = css`
	margin-top: ${space[4]}px;
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
			<Divider
				spaceAbove="tight"
				cssOverrides={[divider, bottomDividerStyles]}
			/>
		</>
	);
};
