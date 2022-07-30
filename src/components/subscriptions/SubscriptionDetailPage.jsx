import React from 'react';

import SubscriptionDetails from './SubscriptionDetails';
import LicenseAllocationDetails from './licenses/LicenseAllocationDetails';
import SubscriptionDetailContextProvider from './SubscriptionDetailContextProvider';

const SubscriptionDetailPage = () => (
  <SubscriptionDetailContextProvider>
    <SubscriptionDetails />
    <LicenseAllocationDetails />
  </SubscriptionDetailContextProvider>
);

export default SubscriptionDetailPage;
