import React from 'react';
import { useRefTracking } from '../lib/hooks/useRefTracking';

export const RefTrackingFormFields = () => {
  const { ref, refViewId } = useRefTracking();

  return (
    <>
      <input type="hidden" name="ref" value={ref} />
      <input type="hidden" name="refViewId" value={refViewId} />
    </>
  );
};
