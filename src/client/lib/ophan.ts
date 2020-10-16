import { OphanABEvent } from '@guardian/types/ophan';

export interface OphanInteraction {
  component: string;
  value?: string;
  atomId?: string;
}

export interface OphanEvent {
  experiences?: string;
  abTestRegister?: { [testId: string]: OphanABEvent };
  interaction?: OphanInteraction;
}

export const record = (event: OphanEvent) => {
  if (
    window.guardian &&
    window.guardian.ophan &&
    window.guardian.ophan.record
  ) {
    window.guardian.ophan.record(event);
  }
};

export const sendOphanInteractionEvent = (interaction: OphanInteraction) =>
  record({ interaction });
