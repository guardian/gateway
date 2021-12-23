import { OphanABEvent } from '@guardian/libs';

export interface OphanInteraction {
  component: string;
  value?: string;
  atomId?: string;
}

export interface OphanBase {
  experiences?: string;
  abTestRegister?: { [testId: string]: OphanABEvent };
}

export type OphanEvent = OphanBase | OphanInteraction;
