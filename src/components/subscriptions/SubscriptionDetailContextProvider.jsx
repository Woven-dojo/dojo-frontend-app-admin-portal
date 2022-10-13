import React, {
  createContext, useContext, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  DEFAULT_PAGE, ACTIVATED, ASSIGNED,
} from './data/constants';
import { useSubscriptionUsers } from './data/hooks';
import { SubscriptionContext } from './SubscriptionData';

export const SubscriptionDetailContext = createContext({});
export const defaultStatusFilter = [ASSIGNED, ACTIVATED].join();

const SubscriptionDetailContextProvider = ({ children }) => {
  // Initialize state needed for the subscription detail view and provide in SubscriptionDetailContext
  const {
    enterpriseId, errors, setErrors,
  } = useContext(SubscriptionContext);

  const [tableParams, setTableParams] = useState({
    currentPage: DEFAULT_PAGE,
    searchQuery: null,
    userStatusFilter: defaultStatusFilter,
  });

  const [users, forceRefreshUsers, loadingUsers] = useSubscriptionUsers({
    ...tableParams,
    enterpriseId,
    errors,
    setErrors,
  });

  const forceRefreshDetailView = () => {
    forceRefreshUsers();
  };

  const context = useMemo(() => ({
    ...tableParams,
    setTableParams,
    enterpriseId,
    users,
    forceRefreshUsers,
    loadingUsers,
    forceRefreshDetailView,
  }), [
    tableParams,
    enterpriseId,
    users,
    loadingUsers,
  ]);
  return (
    <SubscriptionDetailContext.Provider value={context}>
      {children}
    </SubscriptionDetailContext.Provider>
  );
};

SubscriptionDetailContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SubscriptionDetailContextProvider;
