function PVError(name: string, message = '') {
  const error = new Error()
  error.name = name
  error.message = message
  return error
}

const _freeTrialExpiredName = 'freeTrialExpired'
const _loginInvalidName = 'loginInvalid'
const _premiumMembershipExpiredName = 'premiumMembershipExpired'
const _boostPaymentError = '_boostPaymentError'
const _boostPaymentValueTagError = '_boostPaymentValueTagError'

export const Errors = {
  FREE_TRIAL_EXPIRED: {
    name: _freeTrialExpiredName,
    error: () => PVError(_freeTrialExpiredName, 'Free Trial Expired')
  },
  LOGIN_INVALID: {
    name: _loginInvalidName,
    error: () => PVError(_loginInvalidName, 'Invalid username or password')
  },
  PREMIUM_MEMBERSHIP_EXPIRED: {
    name: _premiumMembershipExpiredName,
    error: () => PVError(_premiumMembershipExpiredName, 'Premium Membership Expired')
  },
  BOOST_PAYMENT_ERROR: {
    name: _boostPaymentError,
    error: () => PVError(_boostPaymentError, 'There was a problem with a boost payment')
  },
  BOOST_PAYMENT_VALUE_TAG_ERROR: {
    name: _boostPaymentValueTagError,
    error: () => PVError(_boostPaymentValueTagError, 'Something is wrong with the Podcasters Value-For-Value Tags')
  }
}
