const validClientId = [
  'members',
  'recurringContributions',
  'jobs',
  'comments',
  'subscriptions',
];

export const validateClientId = (clientId?: string): string | undefined =>
  validClientId.find((id) => id === clientId);
