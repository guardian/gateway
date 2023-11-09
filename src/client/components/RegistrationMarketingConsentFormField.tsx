import { css } from '@emotion/react';
import { palette, space, textSans } from '@guardian/source-foundations';
import { Divider } from '@guardian/source-react-components-development-kitchen';
import React from 'react';
import { divider } from '@/client/styles/Shared';
import { MainBodyText } from './MainBodyText';
import { ToggleSwitchInput } from './ToggleSwitchInput';

const { neutral } = palette;

const switchRow = css`
	border: 0;
	padding: 0;
	margin: ${space[2]}px 0 0 0;
	${textSans.medium()}
`;

const labelStyles = css`
	font-weight: bold;
	justify-content: space-between;
`;

const bottomDividerStyles = css`
	margin-top: ${space[4]}px;
`;

const supportingText = css`
	font-size: 15px;
	color: ${neutral[46]};
	margin-right: 54px;
`;

export const RegistrationMarketingConsentFormField = () => {
	return (
		<>
			<Divider spaceAbove="tight" cssOverrides={divider} />
			<fieldset css={switchRow}>
				<ToggleSwitchInput
					id="marketing"
					label="Stay up-to-date"
					defaultChecked={true}
					cssOverrides={labelStyles}
				/>
			</fieldset>
			<MainBodyText noMarginBottom cssOverrides={supportingText}>
				Supporting the Guardian Information on our products and ways to enjoy
				and support our independent journalism
			</MainBodyText>
			<Divider
				spaceAbove="tight"
				cssOverrides={[divider, bottomDividerStyles]}
			/>
		</>
	);
};
