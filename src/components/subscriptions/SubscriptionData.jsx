import React, { createContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

export const SubscriptionContext = createContext({});

export default function SubscriptionData({ children, enterpriseId }) {
  const [errors, setErrors] = useState({});
  const context = useMemo(() => ({
    data: [],
    enterpriseId,
    errors,
    setErrors,
  }), [enterpriseId, errors]);

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
