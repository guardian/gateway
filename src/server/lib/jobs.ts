import { addToGroup, GroupCode, updateName } from './idapi/user';

const setupJobsUser = async (
  firstName: string,
  secondName: string,
  ip: string,
  sc_gu_u: string,
) => {
  // When a jobs user is registering, we'd like to add them to the GRS group.
  // We also want to set their first and last name—these are required fields for all Jobs users.
  //
  // Once users belong to the GRS group, they aren't shown the /accept/GRS page when
  // they try to sign in to the Jobs site for the first time.
  try {
    await updateName(firstName, secondName, ip, sc_gu_u);
    await addToGroup(GroupCode.GRS, ip, sc_gu_u);
  } catch (error) {}
};

export default setupJobsUser;
