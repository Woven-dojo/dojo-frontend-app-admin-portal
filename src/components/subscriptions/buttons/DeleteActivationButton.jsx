import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  AlertModal,
  ActionRow,
  useToggle,
  Icon,
} from '@edx/paragon';
import { Delete } from '@edx/paragon/icons';
import { logError } from '@edx/frontend-platform/logging';
import { SubscriptionContext } from '../SubscriptionData';
import { DISABLE_ACTIVATION } from '../data/constants';
import LmsApiService from '../../../data/services/LmsApiService';
import { ToastsContext } from '../../Toasts';
import { SubscriptionDetailContext } from '../SubscriptionDetailContextProvider';

const DeleteActivationButton = ({ activationLinkId }) => {
  const [isOpen, open, close] = useToggle(false);
  const { addToast } = useContext(ToastsContext);
  const {
    forceRefreshDetailView,
  } = useContext(SubscriptionDetailContext);
  const {
    enterpriseId, errors, setErrors,
  } = useContext(SubscriptionContext);

  const disableActivationLink = async () => {
    await LmsApiService.disableActivationLink(enterpriseId, activationLinkId)
      .then(() => {
        forceRefreshDetailView();
        addToast('Activation link was disabled successfully.');
      })
      .catch((err) => {
        logError(err);
        setErrors({
          ...errors,
          [DISABLE_ACTIVATION]: err?.response?.data?.detail,
        });
      });
  };

  return (
    <>
      <Icon role="button" src={Delete} onClick={open} />

      <AlertModal
        title="Are you sure you want to disable this link?"
        hasCloseButton
        isOpen={isOpen}
        onClose={close}
        footerNode={(
          <ActionRow>
            <Button variant="tertiary" onClick={close}>Cancel</Button>
            <Button variant="danger" onClick={disableActivationLink}>Disable</Button>
          </ActionRow>
        )}
      >
        <p>
          If you disable this activation link, the user will no longer be able activate
          their account via the activation link they were emailed. This action cannot be undone.
        </p>
      </AlertModal>
    </>
  );
};

DeleteActivationButton.propTypes = {
  activationLinkId: PropTypes.number.isRequired,
};

export default DeleteActivationButton;
