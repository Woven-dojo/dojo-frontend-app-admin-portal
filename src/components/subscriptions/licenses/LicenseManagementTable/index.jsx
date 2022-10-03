import React, {
  useCallback, useMemo, useContext,
} from 'react';
import ReactDOM from 'react-dom';
import {
  DataTable,
  TextFilter,
  useWindowSize,
  breakpoints,
} from '@edx/paragon';
import debounce from 'lodash.debounce';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { SubscriptionDetailContext, defaultStatusFilter } from '../../SubscriptionDetailContextProvider';
import {
  PAGE_SIZE, DEFAULT_PAGE, ACTIVATED, ASSIGNED,
} from '../../data/constants';
import { DEBOUNCE_TIME_MILLIS } from '../../../../algoliaUtils';
import { ToastsContext } from '../../../Toasts';
import { formatTimestamp } from '../../../../utils';
import LicenseManagementTableBulkActions from './LicenseManagementTableBulkActions';
import LicenseManagementUserBadge from './LicenseManagementUserBadge';
import { SUBSCRIPTION_TABLE_EVENTS } from '../../../../eventTracking';

const getUserStatus = (user) => (user.isActivated ? ACTIVATED : ASSIGNED);

const userRecentAction = (user) => {
  const userStatus = getUserStatus(user);
  switch (userStatus) {
    case ACTIVATED: {
      return `Activated: ${formatTimestamp({ timestamp: user.modified })}`;
    }
    case ASSIGNED: {
      return `Invited: ${formatTimestamp({ timestamp: user.created })}`;
    }
    default: {
      return null;
    }
  }
};

// const selectColumn = {
//   id: 'selection',
//   Header: DataTable.ControlledSelectHeader,
//   Cell: DataTable.ControlledSelect,
//   disableSortBy: true,
// };

const LicenseManagementTable = () => {
  const { addToast } = useContext(ToastsContext);

  const { width } = useWindowSize();
  const showFiltersInSidebar = useMemo(() => width > breakpoints.medium.maxWidth, [width]);

  const {
    currentPage,
    enterpriseId,
    forceRefreshDetailView,
    searchQuery,
    setSearchQuery,
    setCurrentPage,
    users,
    forceRefreshUsers,
    loadingUsers,
    setUserStatusFilter,
  } = useContext(SubscriptionDetailContext);

  const sendStatusFilterEvent = (statusFilter) => {
    sendEnterpriseTrackEvent(
      enterpriseId,
      SUBSCRIPTION_TABLE_EVENTS.FILTER_STATUS,
      { applied_filters: statusFilter },
    );
  };

  const sendEmailFilterEvent = () => {
    sendEnterpriseTrackEvent(
      enterpriseId,
      SUBSCRIPTION_TABLE_EVENTS.FILTER_EMAIL,
    );
  };

  const sendPaginationEvent = (oldPage, newPage) => {
    const eventName = newPage - oldPage > 0
      ? SUBSCRIPTION_TABLE_EVENTS.PAGINATION_NEXT
      : SUBSCRIPTION_TABLE_EVENTS.PAGINATION_PREVIOUS;

    sendEnterpriseTrackEvent(
      enterpriseId,
      eventName,
      { page: newPage },
    );
  };

  // Filtering and pagination
  const updateFilters = (filters) => {
    if (filters.length < 1) {
      setSearchQuery(null);
      setUserStatusFilter(defaultStatusFilter);
    } else {
      filters.forEach((filter) => {
        switch (filter.id) {
          case 'statusBadge': {
            const newStatusFilter = filter.value.join();
            sendStatusFilterEvent(newStatusFilter);
            setUserStatusFilter(newStatusFilter);
            break;
          }
          case 'emailLabel': {
            sendEmailFilterEvent();
            Promise.resolve().then(() => {
              ReactDOM.unstable_batchedUpdates(() => {
                if (searchQuery !== filter.value) {
                  setCurrentPage(DEFAULT_PAGE);
                }
                setSearchQuery(filter.value);
              });
            });
            break;
          }
          default: break;
        }
      });
    }
  };

  const debouncedUpdateFilters = debounce(
    updateFilters,
    DEBOUNCE_TIME_MILLIS,
  );

  const debouncedSetCurrentPage = debounce(
    setCurrentPage,
    DEBOUNCE_TIME_MILLIS,
  );
  // Call back function, handles filters and page changes
  const fetchData = useCallback(
    (args) => {
      Promise.resolve().then(() => {
        ReactDOM.unstable_batchedUpdates(() => {
          debouncedUpdateFilters(args.filters);
          // pages index from 1 in backend, DataTable component index from 0
          if (args.pageIndex !== currentPage - 1) {
            debouncedSetCurrentPage(args.pageIndex + 1);
            sendPaginationEvent(currentPage - 1, args.pageIndex);
          }
        });
      });
    },
    [currentPage],
  );

  const getActiveFilters = columns => columns.map(column => ({
    name: column.id,
    filter: column.filter,
    filterValue: column.filterValue,
  })).filter(filter => !!filter.filterValue);

  // Maps user to rows
  const rows = useMemo(
    () => users?.results?.map(user => ({
      email: user.email,
      emailLabel: <span data-hj-suppress>{user.email}</span>,
      status: getUserStatus(user),
      statusBadge: <LicenseManagementUserBadge userStatus={getUserStatus(user)} />,
      recentAction: userRecentAction(user),
    })),
    [users],
  );

  const onEnrollSuccess = (clearTableSelectionCallback) => (() => {
    clearTableSelectionCallback();
    forceRefreshUsers();
  });
  // Successful action modal callback
  const onRemindSuccess = (clearTableSelectionCallback) => (() => {
    // Refresh users to get updated lastRemindDate
    clearTableSelectionCallback();
    forceRefreshUsers();
    addToast('Users successfully reminded');
  });
  const onRevokeSuccess = (clearTableSelectionCallback) => (() => {
    // Refresh subscription and user data to get updated revoke count and revoked list of users
    clearTableSelectionCallback();
    forceRefreshDetailView();
    addToast('Licenses successfully revoked');
  });

  // const tableActions = useMemo(() => {
  //   return [<DownloadCsvButton />];
  // }, []);

  return (
    <>
      <DataTable
        showFiltersInSidebar={showFiltersInSidebar}
        isLoading={loadingUsers}
        isFilterable
        manualFilters
        // manualSelectColumn={selectColumn}
        SelectionStatusComponent={DataTable.ControlledSelectionStatus}
        defaultColumnValues={{ Filter: TextFilter }}
        isPaginated
        manualPagination
        itemCount={users.count}
        pageCount={users.numPages || 1}
        // tableActions={tableActions}
        initialState={{
          pageSize: PAGE_SIZE,
          pageIndex: DEFAULT_PAGE - 1,
        }}
        // initialTableOptions={{
        //   getRowId: row => row.id,
        // }}
        EmptyTableComponent={
          () => {
            if (loadingUsers) {
              return null;
            }
            return <DataTable.EmptyTable content="No results found" />;
          }
        }
        fetchData={fetchData}
        data={rows}
        columns={[
          {
            Header: 'Email address',
            accessor: 'emailLabel',
            // eslint-disable-next-line react/prop-types
            Cell: ({ row }) => <span data-hj-suppress>{row.values.emailLabel}</span>,
          },
          {
            Header: 'Status',
            accessor: 'statusBadge',
            disableFilters: true,
            // Filter: CheckboxFilter,
            // filter: 'includesValue',
            // filterChoices: [{
            //   name: 'Active',
            //   // number: overview.activated,
            //   value: ACTIVATED,
            // },
            // {
            //   name: 'Pending',
            //   // number: overview.assigned,
            //   value: ASSIGNED,
            // }],
          },
          {
            Header: 'Recent action',
            accessor: 'recentAction',
            disableFilters: true,
          },
        ]}
        // additionalColumns={[
        //   {
        //     id: 'action',
        //     Header: '',
        //     /* eslint-disable react/prop-types */
        //     Cell: ({ row }) => (
        //       <LicenseManagementTableActionColumn
        //         user={row.original}
        //         subscription={subscription}
        //         disabled={isExpired}
        //         onRemindSuccess={onRemindSuccess}
        //         onRevokeSuccess={onRevokeSuccess}
        //       />
        //       /* eslint-enable */
        //     ),
        //   },
        // ]}
        // TODO: consider refactoring to use default DataTable behavior
        // instead of a custom implementation of these bulk actions
        bulkActions={(data) => {
          const selectedUsers = data.selectedFlatRows.map((selectedRow) => selectedRow.original);
          const {
            itemCount,
            clearSelection,
            controlledTableSelections: [{ selectedRows, isEntireTableSelected }],
          } = data.tableInstance;
          const tableItemCount = isEntireTableSelected ? itemCount : selectedRows.length;

          return (
            <LicenseManagementTableBulkActions
              selectedUsers={selectedUsers}
              onRemindSuccess={onRemindSuccess(clearSelection)}
              onRevokeSuccess={onRevokeSuccess(clearSelection)}
              onEnrollSuccess={onEnrollSuccess(clearSelection)}
              allUsersSelected={data.isEntireTableSelected}
              activeFilters={getActiveFilters(data.tableInstance.columns)}
              tableItemCount={tableItemCount}
            />
          );
        }}
      />
    </>
  );
};

export default LicenseManagementTable;
