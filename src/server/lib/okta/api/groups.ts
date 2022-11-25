import { Group, groupSchema } from '@/server/models/okta/Group';
import { buildUrl } from '@/shared/lib/routeUtils';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { joinUrl } from '@guardian/libs';
import { defaultHeaders, authorizationHeader } from './headers';
import { z } from 'zod';
import { OktaError } from '@/server/models/okta/Error';
import { handleErrorResponse } from './errors';
import { handleVoidResponse } from './responses';

const { okta } = getConfiguration();

/**
 * Okta's Groups API
 * https://developer.okta.com/docs/reference/api/groups
 */

/**
 * @name getGroupByName
 * @description Get a group configured within Okta by name
 *
 * Uses GroupNameCache map to memoize as to cache the response, as the group config is unlikely to change
 *
 * https://developer.okta.com/docs/reference/api/groups/#find-groups
 *
 * @returns {Promise<Group | undefined>}
 */
const GroupNameCache = new Map<string, Group>();
export const getGroupByName = async (
  name: string,
): Promise<Group | undefined> => {
  if (GroupNameCache.has(name)) {
    return Promise.resolve(GroupNameCache.get(name) as Group);
  }

  const path = `${buildUrl(`/api/v1/groups`)}?q=${name}`;

  const groups = await fetch(joinUrl(okta.orgUrl, path), {
    headers: { ...defaultHeaders, ...authorizationHeader() },
  }).then(handleGroupsResponse);

  const group = groups.find((group) => group.profile.name === name);

  if (group) {
    GroupNameCache.set(name, group);
  }

  return group;
};

/**
 * @name removeUserFromGroup
 * @description Remove a user from a group
 *
 * https://developer.okta.com/docs/reference/api/groups/#remove-user-from-group
 *
 * @param userId {string} - The user Okta ID
 * @param groupId {string} - The group Okta ID
 */
export const removeUserFromGroup = async (
  userId: string,
  groupId: string,
): Promise<void> => {
  const path = buildUrl(`/api/v1/groups/:groupId/users/:userId`, {
    groupId,
    userId,
  });

  await fetch(joinUrl(okta.orgUrl, path), {
    method: 'DELETE',
    headers: { ...defaultHeaders, ...authorizationHeader() },
  }).then(handleVoidResponse);
};

/**
 * @name handleGroupsResponse
 * @description Handles the response from Okta's /users/:id/groups endpoint
 * and converts it to an array of Group
 * @param response fetch response object
 * @returns Promise<Group[]>
 */
export const handleGroupsResponse = async (
  response: Response,
): Promise<Group[]> => {
  if (response.ok) {
    try {
      return z.array(groupSchema).parse(await response.json());
    } catch (error) {
      throw new OktaError({
        message: 'Could not parse Okta user group response',
      });
    }
  } else {
    return await handleErrorResponse(response);
  }
};
