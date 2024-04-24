import React from 'react';
import { Meta } from '@storybook/react';

import { DeleteAccountBlocked } from '@/client/pages/DeleteAccountBlocked';

export default {
	title: 'Pages/DeleteAccountBlocked',
	component: DeleteAccountBlocked,
	parameters: { layout: 'fullscreen' },
} as Meta;

export const Member = () => (
	<DeleteAccountBlocked
		contentAccess={{
			digitalPack: false,
			guardianPatron: false,
			guardianWeeklySubscriber: false,
			member: true,
			paidMember: false,
			paperSubscriber: false,
			recurringContributor: false,
			supporterPlus: false,
		}}
	/>
);
Member.story = {
	name: 'with contentAccess.member',
};

export const PaidMember = () => (
	<DeleteAccountBlocked
		contentAccess={{
			digitalPack: false,
			guardianPatron: false,
			guardianWeeklySubscriber: false,
			member: false,
			paidMember: true,
			paperSubscriber: false,
			recurringContributor: false,
			supporterPlus: false,
		}}
	/>
);
PaidMember.story = {
	name: 'with contentAccess.paidMember',
};

export const RecurringContributor = () => (
	<DeleteAccountBlocked
		contentAccess={{
			digitalPack: false,
			guardianPatron: false,
			guardianWeeklySubscriber: false,
			member: false,
			paidMember: false,
			paperSubscriber: false,
			recurringContributor: true,
			supporterPlus: false,
		}}
	/>
);
RecurringContributor.story = {
	name: 'with contentAccess.recurringContributor',
};

export const DigitalPack = () => (
	<DeleteAccountBlocked
		contentAccess={{
			digitalPack: true,
			guardianPatron: false,
			guardianWeeklySubscriber: false,
			member: false,
			paidMember: false,
			paperSubscriber: false,
			recurringContributor: false,
			supporterPlus: false,
		}}
	/>
);
DigitalPack.story = {
	name: 'with contentAccess.digitalPack',
};

export const PaperSubscriber = () => (
	<DeleteAccountBlocked
		contentAccess={{
			digitalPack: false,
			guardianPatron: false,
			guardianWeeklySubscriber: false,
			member: false,
			paidMember: false,
			paperSubscriber: true,
			recurringContributor: false,
			supporterPlus: false,
		}}
	/>
);
PaperSubscriber.story = {
	name: 'with contentAccess.paperSubscriber',
};

export const GuardianWeeklySubscriber = () => (
	<DeleteAccountBlocked
		contentAccess={{
			digitalPack: false,
			guardianPatron: false,
			guardianWeeklySubscriber: true,
			member: false,
			paidMember: false,
			paperSubscriber: false,
			recurringContributor: false,
			supporterPlus: false,
		}}
	/>
);
GuardianWeeklySubscriber.story = {
	name: 'with contentAccess.guardianWeeklySubscriber',
};
