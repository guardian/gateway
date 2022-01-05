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
  if (window.guardian?.ophan?.record) {
    window.guardian.ophan.record(event);
  }
};

export const sendOphanInteractionEvent = ({
  component,
  atomId,
  value,
}: OphanInteraction) => record({ component, atomId, value });

export const trackFormSubmit = (formTrackingName: string): void => {
  sendOphanInteractionEvent({
    component: `${formTrackingName}-form`,
    value: 'submit',
  });
};

export const trackFormFocusBlur = (
  formTrackingName: string,
  event: React.FocusEvent<HTMLFormElement, Element>,
  type: 'focus' | 'blur',
): void => {
  // we only want to track focus on input elements
  if (event.target.tagName === 'INPUT') {
    sendOphanInteractionEvent({
      component: `${formTrackingName}-form`,
      value: `${event.target.name}-input-${type}`,
    });
  }
};
