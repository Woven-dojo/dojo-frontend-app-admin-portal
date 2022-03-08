import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Stack } from '@edx/paragon';

import SubsidyRequestManagementTable, {
  useSubsidyRequests,
  SUPPORTED_SUBSIDY_TYPES,
  PAGE_SIZE,
  REQUEST_STATUS,
} from '../SubsidyRequestManagementTable';
import EnterpriseAccessApiService from '../../data/services/EnterpriseAccessApiService';
import { ApproveCouponCodeRequestModal, DeclineSubsidyRequestModal } from '../subsidy-request-modals';
import { fetchCouponOrders } from '../../data/actions/coupons';
import LoadingMessage from '../LoadingMessage';

const ManageRequestsTab = ({ enterpriseId, loading: loadingCoupons, fetchCoupons }) => {
  useEffect(() => {
    fetchCoupons();
  }, []);

  const {
    isLoading,
    requests,
    requestsOverview,
    handleFetchRequests,
    updateRequestStatus,
  } = useSubsidyRequests(enterpriseId, SUPPORTED_SUBSIDY_TYPES.codes);

  const [selectedRequest, setSelectedRequest] = useState();
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDenyModalOpen, setIsDenyModalOpen] = useState(false);

  if (loadingCoupons) {
    return <LoadingMessage className="coupons mt-3" />;
  }

  return (
    <Stack gap={2}>
      <div>
        <h2>Enrollment requests</h2>
        <p>Approve or decline enrollment requests for individual learners below.</p>
      </div>
      <SubsidyRequestManagementTable
        pageCount={requests.pageCount}
        itemCount={requests.itemCount}
        data={requests.requests}
        fetchData={handleFetchRequests}
        requestStatusFilterChoices={requestsOverview}
        onApprove={(row) => {
          setSelectedRequest(row);
          setIsApproveModalOpen(true);
        }}
        onDecline={(row) => {
          setSelectedRequest(row);
          setIsDenyModalOpen(true);
        }}
        isLoading={isLoading}
        initialTableOptions={{
          getRowId: row => row.uuid,
        }}
        initialState={{
          pageSize: PAGE_SIZE,
          pageIndex: 0,
        }}
      />
      {selectedRequest && (
        <>
          {isApproveModalOpen && (
            <ApproveCouponCodeRequestModal
              isOpen
              couponCodeRequest={selectedRequest}
              onSuccess={() => {
                updateRequestStatus({ request: selectedRequest, newStatus: REQUEST_STATUS.PENDING });
                setIsApproveModalOpen(false);
              }}
              onClose={() => setIsApproveModalOpen(false)}
            />
          )}
          {isDenyModalOpen && (
            <DeclineSubsidyRequestModal
              isOpen
              subsidyRequest={selectedRequest}
              declineRequestFn={EnterpriseAccessApiService.declineCouponCodeRequests}
              onSuccess={() => {
                updateRequestStatus({ request: selectedRequest, newStatus: REQUEST_STATUS.DECLINED });
                setIsDenyModalOpen(false);
              }}
              onClose={() => setIsDenyModalOpen(false)}
            />
          )}
        </>
      )}
    </Stack>
  );
};

ManageRequestsTab.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  fetchCoupons: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  fetchCoupons: (options) => {
    dispatch(fetchCouponOrders(options));
  },
});

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  loading: state.coupons.loading,
});

export default connect(mapStateToProps, mapDispatchToProps)(ManageRequestsTab);
