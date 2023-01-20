import { OphanABEvent, OphanComponentEvent } from '@guardian/libs';

export interface OphanInteraction {
  component: string;
  value?: string;
  atomId?: string;
}

interface OphanBase {
  experiences?: string;
  abTestRegister?: { [testId: string]: OphanABEvent };
}

export type OphanEvent = OphanBase | OphanInteraction | OphanComponentEvent;
