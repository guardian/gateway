export type SubscriptionAction = 'unsubscribe' | 'subscribe';

export const subscriptionActionName = (action: SubscriptionAction) =>
	action === 'unsubscribe' ? 'Unsubscribe' : 'Subscribe';
