import React, { createContext, useMemo } from 'react';
import PropTypes from 'prop-types';

export const SubscriptionContext = createContext({});

export default function SubscriptionData({ children, enterpriseId }) {
  const context = useMemo(() => ({
    data: [],
    enterpriseId,
  }), [enterpriseId]);

  return (
    <SubscriptionContext.Provider value={context}>
      {children}
    </SubscriptionContext.Provider>
  );
}

SubscriptionData.propTypes = {
  children: PropTypes.node.isRequired,
  enterpriseId: PropTypes.string.isRequired,
};
