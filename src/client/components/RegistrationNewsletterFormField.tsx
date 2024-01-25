import { css } from '@emotion/react';
import { palette, space, textSans } from '@guardian/source-foundations';
import React from 'react';
import { ToggleSwitchInput } from '@/client/components/ToggleSwitchInput';
import { IsNativeApp } from '@/shared/model/ClientState';

const switchRow = css`
	border: 0;
	padding: 0;
	margin: ${space[6]}px 0 0 0;
	${textSans.medium()}
	border-radius: 4px;
	border: 1px dashed ${palette.neutral[38]};
	padding: ${space[2]}px;
`;

const labelStyles = (isNativeApp: IsNativeApp) => css`
	justify-content: space-between;
	& > span:first-of-type {
		color: ${palette.neutral[20]};
		${isNativeApp
			? textSans.xsmall({ fontWeight: 'bold' })
			: textSans.small({ fontWeight: 'bold' })};
	}
	& > span:last-of-type {
		color: ${palette.neutral[46]};
		${isNativeApp ? textSans.xsmall() : textSans.small()};
	}
`;

type Props = {
	id: string;
	label: string;
	context?: string;
	imagePath?: string;
	isNativeApp?: IsNativeApp;
	defaultChecked?: boolean;
};

export const RegistrationNewsletterFormField = ({
	id,
	label,
	context,
	imagePath,
	isNativeApp,
	defaultChecked = true,
}: Props) => {
	return (
		<>
			<fieldset css={switchRow}>
				<ToggleSwitchInput
					id={id}
					label={label}
					defaultChecked={defaultChecked}
					cssOverrides={labelStyles(isNativeApp)}
					context={context}
					imagePath={imagePath}
				/>
			</fieldset>
		</>
	);
};
