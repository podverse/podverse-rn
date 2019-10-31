import { logoutUser } from '../state/actions/auth'

const _expiredMessage =
  'To renew your membership, please visit podverse.fm, login, then go to your Settings page.'
const _logoutButtonText = 'Log Out'
const _networkErrorTitle = 'Network Error'

export const Alerts = {
  FREE_TRIAL_EXPIRED: {
    message: _expiredMessage,
    title: 'Free Trial Expired',
    buttons: [{ text: _logoutButtonText, onPress: logoutUser }]
  },
  LOGIN_INVALID: {
    message: 'Invalid username or password.',
    title: 'Login Error'
  },
  NETWORK_ERROR: {
    message: (str?: string) =>
      !str
        ? 'Internet connection required'
        : `You must be connected to the internet to ${str}.`,
    title: _networkErrorTitle
  },
  PLAYER_CANNOT_STREAM_WITHOUT_WIFI: {
    message: 'Connect to Wifi to stream this episode.',
    title: _networkErrorTitle
  },
  PREMIUM_MEMBERSHIP_EXPIRED: {
    message: _expiredMessage,
    title: 'Premium Membership Expired',
    buttons: [{ text: _logoutButtonText, onPress: logoutUser }]
  },
  PREMIUM_MEMBERSHIP_REQUIRED: {
    message: 'Sign up for a premium account to use this feature.',
    title: 'Premium Membership Required'
  },
  RESET_PASSWORD_SUCCESS: {
    message:
      'Please check your inbox. If this email address exists in our system, you should receive a reset password email shortly.',
    title: 'Reset Password Sent'
  },
  SIGN_UP_ERROR: {
    title: 'Sign Up Error'
  },
  SOMETHING_WENT_WRONG: {
    message: 'Please check your internet connection and try again later.',
    title: _networkErrorTitle
  },
  LEAVING_APP: {
    title: 'Leaving App',
    message:
      'You are about to be navigated to a website outside the app. Are you sure you want to leave Podverse?'
  }
}
