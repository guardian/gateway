import React from 'react';
import { ToggleSwitchInput } from '@/client/components/ToggleSwitchInput';

type Props = {
	id: string;
	title: string;
	description: string;
	imagePath?: string;
	defaultChecked?: boolean;
};

export const RegistrationNewsletterFormField = ({
	id,
	title,
	description,
	imagePath,
	defaultChecked = true,
}: Props) => {
	return (
		<ToggleSwitchInput
			id={id}
			title={title}
			defaultChecked={defaultChecked}
			description={description}
			imagePath={imagePath}
		/>
	);
};
