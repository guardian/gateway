/// <reference types="@emotion/react/types/css-prop" />

import { RenderOptions } from '@/client/lib/hooks/useRecaptcha';
import { RoutingConfig } from '@/shared/model/RoutingConfig';
import { ABTestAPI } from '@guardian/ab-core';

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
      routingConfig: RoutingConfig;
      abTestApi?: ABTestAPI;
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
