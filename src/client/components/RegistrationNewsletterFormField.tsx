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
	& > span:first-of-type {
		color: ${palette.neutral[20]};
		${textSans.xsmall({ fontWeight: 'bold' })}
	}
	& > span:last-of-type {
		align-self: flex-start;
		color: ${palette.neutral[46]};
		${textSans.xsmall()}
	}
`;

type Props = {
	id: string;
	label: string;
	context?: string;
	imagePath?: string;
	defaultChecked?: boolean;
};

export const RegistrationNewsletterFormField = ({
	id,
	label,
	context,
	imagePath,
	defaultChecked = true,
}: Props) => {
	return (
		<>
			<fieldset css={switchRow}>
				<ToggleSwitchInput
					id={id}
					label={label}
					defaultChecked={defaultChecked}
					cssOverrides={labelStyles}
					context={context}
					imagePath={imagePath}
				/>
			</fieldset>
		</>
	);
};
