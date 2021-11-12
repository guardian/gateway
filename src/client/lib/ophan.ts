import { OphanABEvent } from '@guardian/libs';

interface OphanInteraction {
  component: string;
  value?: string;
  atomId?: string;
}

interface OphanBase {
  experiences?: string;
  abTestRegister?: { [testId: string]: OphanABEvent };
}

type OphanEvent = OphanBase | OphanInteraction;

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
