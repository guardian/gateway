import { updateUser } from './okta/api/users';

export const setupJobsUserInOkta = (
	firstName: string,
	lastName: string,
	id: string,
	ip?: string,
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
	return updateUser(
		id,
		{
			profile: {
				isJobsUser: true,
				firstName,
				lastName,
			},
		},
		ip,
	);
};
