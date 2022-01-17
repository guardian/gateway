export const validClientId = [
  'members',
  'recurringContributions',
  'jobs',
  'comments',
  'subscriptions',
] as const;

export type ValidClientId = typeof validClientId[number];
