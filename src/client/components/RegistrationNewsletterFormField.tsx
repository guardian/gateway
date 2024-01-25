import { css } from '@emotion/react';
import { palette, space, textSans } from '@guardian/source-foundations';
import React from 'react';
import { ToggleSwitchInput } from '@/client/components/ToggleSwitchInput';
import { IsNativeApp } from '@/shared/model/ClientState';
import { SATURDAY_EDITION_SMALL_SQUARE_IMAGE } from '@/client/assets/newsletters';
import { Newsletters } from '@/shared/model/Newsletter';

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
	isNativeApp?: IsNativeApp;
};

export const RegistrationNewsletterFormField = ({ isNativeApp }: Props) => {
	return (
		<>
			<fieldset css={switchRow}>
				<ToggleSwitchInput
					id={Newsletters.SATURDAY_EDITION}
					label="Saturday Edition"
					defaultChecked={true}
					cssOverrides={labelStyles(isNativeApp)}
					context="An exclusive email highlighting the week&lsquo;s best Guardian
					journalism from the editor-in-chief, Katharine Viner."
					imagePath={SATURDAY_EDITION_SMALL_SQUARE_IMAGE}
				/>
			</fieldset>
		</>
	);
};
