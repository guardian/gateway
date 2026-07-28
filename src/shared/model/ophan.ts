import {
	ComponentEvent,
	AbTestRegisterEntry,
} from '@guardian/ophan-tracker-js';

export interface OphanInteraction {
	component: string;
	value?: string;
	atomId?: string;
}

interface OphanBase {
	experiences?: string;
	abTestRegister?: Record<string, AbTestRegisterEntry>;
}

export type OphanEvent =
	| OphanBase
	| OphanInteraction
	| { componentEvent: ComponentEvent };
