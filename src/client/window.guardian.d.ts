/// <reference types="@emotion/react/types/css-prop" />

declare global {
  /*
   * Here, declare things that go in the global namespace, or augment
   * existing declarations in the global namespace
   */
  interface Window {
    guardian: {
      ophan: {
        record: ({}) => void;
        viewId: string;
        pageViewId: string;
      };
    };
    Cypress: unknown;
    ga: unknown;
    grecaptcha: {
      ready: ({}) => void;
      execute: () => void;
      render: (
        element: string,
        options: {
          sitekey: string;
          size: string;
          callback: (token: string) => void;
        },
      ) => void;
    };
  }
}

/* this line is required as per TypeScript's global-modifying-module.d.ts instructions */
export {};
