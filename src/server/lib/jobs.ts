import { addToGroup, GroupCode, updateName } from './idapi/user';

const setupJobsUser = async (
  firstName: string,
  secondName: string,
  ip: string,
  sc_gu_u: string,
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
  return await Promise.all([
    updateName(firstName, secondName, ip, sc_gu_u),
    addToGroup(GroupCode.GRS, ip, sc_gu_u),
  ]);
};

export default setupJobsUser;
