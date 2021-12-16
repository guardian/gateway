import { TrackingQueryParams } from '@/shared/model/QueryParams';

// react hook for getting the `ref` and `refViewId` for tracking
// `ref` is the current url of the page we want to track
// `refViewId` is the current ophan page view id we want to track
export const useRefTracking = (): TrackingQueryParams => {
  if (typeof window !== 'undefined') {
    return {
      ref: `${window.location.origin}${window.location.pathname}`,
      refViewId: window.guardian.ophan?.viewId,
    };
  }
  return {};
};
