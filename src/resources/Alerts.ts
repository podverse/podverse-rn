import { sendVerificationEmail } from '../services/auth'
import { logoutUser } from '../state/actions/auth'

const _expiredMessage =
  'To renew your membership, please visit podverse.fm, login, then go to your Settings page.'
const _logoutButtonText = 'Log Out'
const _networkErrorTitle = 'Network Error'
const _sendEmailText = 'Send Email'
const _sendVerificationEmailMessage =
  'You must verify your email address to login. Press Send Email then check your inbox of a verification email.'
const _cancelText = 'Cancel'

export const Alerts = {
  BUTTONS: {
    OK: [{ text: 'OK' }]
  },
  EMAIL_NOT_VERIFIED: (email: string) => ({
    message: _sendVerificationEmailMessage,
    title: 'Verify Your Email',
    buttons: [
      { text: _cancelText },
      { text: _sendEmailText, onPress: () => sendVerificationEmail(email) }
    ]
  }),
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
  PURCHASE_CANCELLED: {
    message: 'Purchase has been cancelled. If you are seeing this in error, please contact support.',
    title: 'Purchase Cancelled'
  },
  PURCHASE_CONSUMED: {
    message: 'An invalid receipt was provided. Please contact support if you need help completing a purchase.',
    title: 'Invalid Purchase'
  },
  PURCHASE_PENDING: {
    message: 'Purchase is still pending...',
    title: 'Purchase Pending'
  },
  PURCHASE_SUCCESS: {
    message: 'Your purchase was successful. You may close this window.',
    title: 'Purchase Success'
  },
  PURCHASE_SOMETHING_WENT_WRONG: {
    message: 'Please retry processing (you won\'t be charged again) or contact support.',
    title: 'Purchase Incomplete'
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
