import {
	AbTestRegisterEntry,
	ComponentEvent as OphanComponentEvent,
	Interaction as OphanInteraction,
} from '@guardian/ophan-tracker-js';

interface OphanBase {
	experiences?: string[];
	abTestRegister?: Record<string, AbTestRegisterEntry>;
}

export type OphanEvent =
	| OphanBase
	| OphanInteraction
	| { componentEvent: OphanComponentEvent };
