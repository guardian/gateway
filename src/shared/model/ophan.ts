import type { OphanABEvent, OphanComponentEvent } from '@guardian/libs';

export interface OphanInteraction {
	component: string;
	value?: string;
	atomId?: string;
}

interface OphanBase {
	experiences?: string;
	abTestRegister?: Record<string, OphanABEvent>;
}

export type OphanEvent =
	| OphanBase
	| OphanInteraction
	| { componentEvent: OphanComponentEvent };
