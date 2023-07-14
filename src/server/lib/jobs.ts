import { addToGroup, GroupCode, updateName } from './idapi/user';
import { updateUser } from './okta/api/users';
import { logger } from '@/server/lib/serverSideLogger';

export const setupJobsUserInOkta = (
	firstName: string,
	lastName: string,
	id: string,
) => {
	if (firstName === '' || lastName === '') {
		throw new Error('Empty values not permitted for first or last name.');
	}
	// When a jobs user is registering in Okta, we set the `isJobsUser` flag to true.
	// We also want to set their first and last name as these are required fields for all Jobs users.
	//
	// Once user have `isJobsUser` set to true, they are no longer shown the /accept/GRS page
	// they try to sign in to the Jobs site again.
	//
	// When `isJobsUser` is set to true, Madgex will see that the user belongs to the GRS group
	// because we have made the `isJobsUser` flag the source of truth for this group membership
	// when IDAPI returns the user's groups, overriding the value stored in Postgres.
	return updateUser(id, {
		profile: {
			isJobsUser: true,
			firstName,
			lastName,
		},
	});
};

export const setupJobsUserInIDAPI = async (
	firstName: string,
	secondName: string,
	ip: string,
	sc_gu_u: string,
	request_id?: string,
) => {
	if (firstName === '' || secondName === '') {
		throw new Error('Empty values not permitted for first or last name.');
	}
	// When a jobs user is registering, we add them to the GRS group and set their full name.
	// We also want to set their first and last name—these are required fields for all Jobs users.
	//
	// Once users belong to the GRS group, they aren't shown the /accept/GRS page when
	// they try to sign in to the Jobs site for the first time.
	//
	// We can resolve both promises here because they are not dependent on each other.
	try {
		await updateName(firstName, secondName, ip, sc_gu_u, request_id);
		await addToGroup(GroupCode.GRS, ip, sc_gu_u, request_id);
		return true;
	} catch (error) {
		logger.error(
			'Jobs: Failed setting the name and/or the group for Jobs user.',
			error,
			{ request_id },
		);
		throw error;
	}
};
