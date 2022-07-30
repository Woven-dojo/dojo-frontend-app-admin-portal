import { logError } from '@edx/frontend-platform/logging';
import {
  USER_SUBSCRIPTION_REQUEST,
  USER_SUBSCRIPTION_SUCCESS,
  USER_SUBSCRIPTION_FAILURE,
} from '../constants/userSubscription';

import LmsApiService from '../services/LmsApiService';

const sendSubscribeUsersRequest = () => ({
  type: USER_SUBSCRIPTION_REQUEST,
});

const sendUserSubscriptionSuccess = data => ({
  type: USER_SUBSCRIPTION_SUCCESS,
  payload: {
    data,
  },
});

const sendUserSubscriptionFailure = error => ({
  type: USER_SUBSCRIPTION_FAILURE,
  payload: {
    error,
  },
});

const addLicensesForUsers = ({
  options,
  enterpriseUUID,
  onSuccess = () => {},
  onError = () => {},
}) => (
  (dispatch) => {
    dispatch(sendSubscribeUsersRequest());
    return LmsApiService.licenseAssign(options, enterpriseUUID).then((response) => {
      dispatch(sendUserSubscriptionSuccess(response));
      onSuccess(response);
    }).catch((error) => {
      logError(error);
      dispatch(sendUserSubscriptionFailure(error));
      onError(error);
    });
  }
);

export default addLicensesForUsers;
