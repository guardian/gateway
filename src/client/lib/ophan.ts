import { OphanABEvent } from '@guardian/types/ophan';

export interface OphanInteraction {
  component: string;
  value?: string;
  atomId?: string;
}

export interface OphanBase {
  experiences?: string;
  abTestRegister?: { [testId: string]: OphanABEvent };
}

export type OphanEvent = OphanBase & OphanInteraction;

export const record = (event: OphanEvent) => {
  if (
    window.guardian &&
    window.guardian.ophan &&
    window.guardian.ophan.record
  ) {
    window.guardian.ophan.record(event);
  }
};

export const sendOphanInteractionEvent = ({
  component,
  atomId,
  value,
}: OphanInteraction) => record({ component, atomId, value });
