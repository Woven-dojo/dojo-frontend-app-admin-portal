import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import InviteLearnersModal from '../../../containers/InviteLearnersModal';
import ActionButtonWithModal from '../../ActionButtonWithModal';
import { SubscriptionContext } from '../SubscriptionData';

export const INVITE_LEARNERS_BUTTON_TEXT = 'Invite learners';

const InviteLearnersButton = ({ onSuccess, onClose, disabled }) => {
  const { enterpriseId } = useContext(SubscriptionContext);
  return (
    <ActionButtonWithModal
      buttonLabel={INVITE_LEARNERS_BUTTON_TEXT}
      buttonClassName="invite-learners-btn"
      variant="primary"
      renderModal={({ closeModal }) => (
        <InviteLearnersModal
          enterpriseUUID={enterpriseId}
          onSuccess={onSuccess}
          onClose={() => {
            closeModal();
            if (onClose) {
              onClose();
            }
          }}
        />
      )}
      disabled={disabled}
    />
  );
};

InviteLearnersButton.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  disabled: PropTypes.bool,
};

InviteLearnersButton.defaultProps = {
  onClose: null,
  disabled: false,
};

export default InviteLearnersButton;
