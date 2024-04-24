import React from 'react';
import { Meta } from '@storybook/react';

import { RegistrationNewsletterFormField } from '@/client/components/RegistrationNewsletterFormField';
import { RegistrationNewslettersFormFields } from '@/shared/model/Newsletter';
import { SATURDAY_EDITION_SMALL_SQUARE_IMAGE } from '@/client/assets/newsletters';

export default {
	title: 'Components/RegistrationNewsletterFormField',
	component: RegistrationNewsletterFormField,
} as Meta;

export const Default = () => {
	return (
		<RegistrationNewsletterFormField
			id={RegistrationNewslettersFormFields.saturdayEdition.id}
			label={`${RegistrationNewslettersFormFields.saturdayEdition.label} newsletter`}
			context={RegistrationNewslettersFormFields.saturdayEdition.context}
			imagePath={SATURDAY_EDITION_SMALL_SQUARE_IMAGE}
		/>
	);
};
Default.storyName = 'default';

export const WithoutImage = () => {
	return (
		<RegistrationNewsletterFormField
			id={RegistrationNewslettersFormFields.saturdayEdition.id}
			label={`${RegistrationNewslettersFormFields.saturdayEdition.label} newsletter`}
			context={RegistrationNewslettersFormFields.saturdayEdition.context}
		/>
	);
};
