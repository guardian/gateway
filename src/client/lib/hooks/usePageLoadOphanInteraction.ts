import { useEffect } from 'react';
import { sendOphanInteractionEvent } from '@/client/lib/ophan';

export const usePageLoadOphanInteraction = (page?: string): void => {
  useEffect(() => {
    if (page) {
      sendOphanInteractionEvent({
        component: `${page}-page`,
        value: 'render',
      });
    }
  }, [page]);
};
