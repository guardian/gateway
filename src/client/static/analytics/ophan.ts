import 'ophan-tracker-js';

// the 'guardian.ophan' object is added by ophan-tracker-js
// we extend the Window interface here to keep Typescript happy
interface OphanWindow extends Window {
  guardian: {
    ophan: {
      setEventEmitter: () => void;
      trackComponentAttention: (
        name: string,
        el: Element,
        visiblityThreshold: number,
      ) => void;
      record: ({}) => void;
      viewId: string;
      pageViewId: string;
    };
  };
}

declare let window: OphanWindow;

interface OphanEvent {
  experiences: string;
  abTestRegister?: { [testId: string]: TestData };
}

interface TestData {
  variantName: string;
  complete: boolean;
  campaignCodes?: Set<string>;
}

const record = (event: OphanEvent) => {
  if (
    window.guardian &&
    window.guardian.ophan &&
    window.guardian.ophan.record
  ) {
    window.guardian.ophan.record(event);
  } else {
    throw new Error("window.guardian.ophan.record doesn't exist");
  }
};

export const init = () => {
  record({
    experiences: 'gateway',
    abTestRegister: {
      gateway: {
        variantName: 'gateway',
        complete: false,
      },
    },
  });
};
