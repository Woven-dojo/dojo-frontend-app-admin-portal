import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Stack } from '@edx/paragon';
import { connect } from 'react-redux';

import SubsidyRequestManagementTable, {
  useSubsidyRequests,
  SUPPORTED_SUBSIDY_TYPES,
  PAGE_SIZE,
  SUBSIDY_REQUEST_STATUS,
} from '../SubsidyRequestManagementTable';
import { ApproveLicenseRequestModal, DeclineSubsidyRequestModal } from '../subsidy-request-modals';
import EnterpriseAccessApiService from '../../data/services/EnterpriseAccessApiService';

const SubscriptionSubsidyRequests = ({ enterpriseId }) => {
  const {
    isLoading,
    requests,
    requestsOverview,
    handleFetchRequests,
    updateRequestStatus,
  } = useSubsidyRequests(enterpriseId, SUPPORTED_SUBSIDY_TYPES.licenses);

  const [selectedRequest, setSelectedRequest] = useState();
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDenyModalOpen, setIsDenyModalOpen] = useState(false);

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
            <ApproveLicenseRequestModal
              isOpen
              licenseRequest={selectedRequest}
              onSuccess={() => {
                updateRequestStatus({ request: selectedRequest, newStatus: SUBSIDY_REQUEST_STATUS.PENDING });
                setIsApproveModalOpen(false);
              }}
              onClose={() => setIsApproveModalOpen(false)}
            />
          )}
          {isDenyModalOpen && (
            <DeclineSubsidyRequestModal
              isOpen
              subsidyRequest={selectedRequest}
              declineRequestFn={EnterpriseAccessApiService.declineLicenseRequests}
              onSuccess={() => {
                updateRequestStatus({ request: selectedRequest, newStatus: SUBSIDY_REQUEST_STATUS.DECLINED });
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

SubscriptionSubsidyRequests.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(SubscriptionSubsidyRequests);
