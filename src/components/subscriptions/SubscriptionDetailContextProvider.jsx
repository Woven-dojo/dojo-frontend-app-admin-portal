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
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [searchQuery, setSearchQuery] = useState(null);
  const [userStatusFilter, setUserStatusFilter] = useState(defaultStatusFilter);

  const [users, forceRefreshUsers, loadingUsers] = useSubscriptionUsers({
    currentPage,
    searchQuery,
    enterpriseId,
    errors,
    setErrors,
    userStatusFilter,
  });

  const forceRefreshDetailView = () => {
    forceRefreshUsers();
  };

  const context = useMemo(() => ({
    currentPage,
    enterpriseId,
    searchQuery,
    setCurrentPage,
    setSearchQuery,
    users,
    forceRefreshUsers,
    loadingUsers,
    setUserStatusFilter,
    forceRefreshDetailView,
  }), [
    currentPage,
    enterpriseId,
    userStatusFilter,
    searchQuery,
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
