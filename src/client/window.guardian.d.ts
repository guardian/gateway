/// <reference types="@emotion/react/types/css-prop" />

import { RenderOptions } from '@/client/lib/hooks/useRecaptcha';

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
      modules: {
        sentry: {
          reportError: (error: Error, feature: string) => void;
        };
      };
    };
    Cypress: unknown;
    ga: unknown;
    grecaptcha: {
      ready: (readyCallback: () => void) => void;
      reset: (element: number) => void;
      execute: (element: number) => void;
      render: (
        element: HTMLDivElement | string,
        options: RenderOptions,
      ) => number;
    };
  }
}

/* this line is required as per TypeScript's global-modifying-module.d.ts instructions */
export {};
