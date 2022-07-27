import React, { useContext } from 'react';
import { Row, Col } from '@edx/paragon';

import { SubscriptionDetailContext } from './SubscriptionDetailContextProvider';
import InviteLearnersButton from './buttons/InviteLearnersButton';
import { ToastsContext } from '../Toasts';

const SubscriptionDetails = () => {
  const {
    forceRefreshDetailView,
  } = useContext(SubscriptionDetailContext);
  const { addToast } = useContext(ToastsContext);

  return (
    <>
      <Row className="mb-4">
        <Col className="mb-3 mb-lg-0">
          <Row className="m-0 justify-content-between">
            <div />
            <div className="text-md-right">
              <InviteLearnersButton
                onSuccess={({ numAlreadyAssociated, numSuccessfulAssignments }) => {
                  forceRefreshDetailView();
                  addToast(`${numAlreadyAssociated} email addresses were previously assigned. ${numSuccessfulAssignments} email addresses were successfully added.`);
                }}
              />
            </div>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default SubscriptionDetails;
