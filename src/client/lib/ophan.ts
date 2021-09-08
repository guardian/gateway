import { OphanABEvent } from '@guardian/libs';

export interface OphanInteraction {
  component: string;
  value?: string;
  atomId?: string;
}

interface OphanReferrer {
  viewId?: string;
}

export interface OphanBase {
  experiences?: string;
  abTestRegister?: { [testId: string]: OphanABEvent };
}

export type OphanEvent = OphanBase | OphanInteraction | OphanReferrer;

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

export const sendOphanReferrerEvent = ({ viewId }: OphanReferrer) =>
  record({ viewId });
