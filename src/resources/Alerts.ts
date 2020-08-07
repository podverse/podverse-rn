import { translate } from '../lib/i18n'
import { NowPlayingItem } from '../lib/NowPlayingItem'
import { sendVerificationEmail } from '../services/auth'
import { logoutUser } from '../state/actions/auth'
import { loadItemAndPlayTrack } from '../state/actions/player'

const _expiredMessage = 'To renew your membership, please visit podverse.fm, login, then go to your Settings page.'
const _logoutButtonText = 'Log Out'
const _networkErrorTitle = 'Network Error'
const _sendEmailText = 'Send Email'
const _sendVerificationEmailMessage =
  'You must verify your email address to login. Press Send Email then check your inbox of a verification email.'
const _cancelText = 'Cancel'

export const Alerts = {
  ASK_TO_SYNC_WITH_LAST_HISTORY_ITEM: (item: NowPlayingItem) => {
    const title = item.clipId ? item.clipTitle : item.episodeTitle
    const type = item.clipId ? 'Clip' : 'Episode'

    return {
      message: `Do you want to resume ${item.podcastTitle} - ${title}?`,
      title: `Most Recent ${type}`,
      buttons: [
        { text: 'No' },
        { text: 'Yes', onPress: () => loadItemAndPlayTrack(item, /* shouldPlay */ false, true) }
      ]
    }
  },
  BUTTONS: {
    OK: [{ text: 'OK' }]
  },
  EMAIL_NOT_VERIFIED: (email: string) => ({
    message: _sendVerificationEmailMessage,
    title: 'Verify Your Email',
    buttons: [{ text: _cancelText }, { text: _sendEmailText, onPress: () => sendVerificationEmail(email) }]
  }),
  FREE_TRIAL_EXPIRED: {
    message: _expiredMessage,
    title: 'Free Trial Expired',
    buttons: [{ text: _logoutButtonText, onPress: logoutUser }]
  },
  LEAVING_APP: {
    title: 'Leaving App',
    message: 'You are about to be navigated to a website outside the app. Are you sure you want to leave Podverse?'
  },
  LOGIN_INVALID: {
    message: translate('Invalid username or password'),
    title: 'Login Error'
  },
  NETWORK_ERROR: {
    message: (str?: string) =>
      !str ? 'Internet connection required' : `You must be connected to the internet to ${str}.`,
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
  PURCHASE_PENDING: {
    message: 'Purchase is still pending...',
    title: 'Purchase Pending'
  },
  PURCHASE_SUCCESS: {
    message: 'Your purchase was successful. You may close this window.',
    title: 'Purchase Success'
  },
  PURCHASE_SOMETHING_WENT_WRONG: {
    message: "Please retry processing (you won't be charged again) or contact support.",
    title: 'Purchase Incomplete'
  },
  RESET_PASSWORD_SUCCESS: {
    message:
      `Please check your inbox. If this address exists in our system, 
      you should receive a reset password email shortly.` + 'The email may go to your Spam folder.',
    title: 'Reset Password Sent'
  },
  SIGN_UP_ERROR: {
    title: 'Sign Up Error'
  },
  SOMETHING_WENT_WRONG: {
    message: 'Please check your internet connection and try again later.',
    title: _networkErrorTitle
  }
}
