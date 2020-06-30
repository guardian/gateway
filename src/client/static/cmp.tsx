import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { shouldShow } from '@guardian/consent-management-platform';
import { ConsentManagementPlatform } from '@guardian/consent-management-platform/dist/ConsentManagementPlatform';

const CMP = () => {
  const [showCmp, setShowCmp] = useState<boolean>();

  useEffect(() => {
    if (shouldShow()) {
      setShowCmp(true);
    }
  }, []);

  const props = {
    source: 'manage',
    onClose: () => setShowCmp(false),
    fontFamilies: {
      headlineSerif: 'GH Guardian Headline, Georgia, serif',
      bodySerif: 'GuardianTextEgyptian, Georgia, serif',
      bodySans:
        'GuardianTextSans, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif',
    },
  };

  return <>{showCmp && <ConsentManagementPlatform {...props} />}</>;
};

// CMP module
ReactDOM.render(<CMP />, document.getElementById('cmp'));
