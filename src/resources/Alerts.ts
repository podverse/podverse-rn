import { NowPlayingItem } from 'podverse-shared'
import { translate } from '../lib/i18n'
import { sendVerificationEmail } from '../services/auth'
import { logoutUser } from '../state/actions/auth'
import { loadItemAndPlayTrack } from '../state/actions/player'

const _expiredMessage = translate('To renew your membership please visit the Membership page')
const _logoutButtonText = translate('Log Out')
const _networkErrorTitle = translate('Network error')
const _sendEmailText = translate('Send Email')
const _sendVerificationEmailMessage = translate(
  'You must verify your email address to login Press Send Email then check your inbox of a verification email'
)
const _cancelText = translate('Cancel')

export const Alerts = {
  ASK_TO_SYNC_WITH_LAST_HISTORY_ITEM: (item: NowPlayingItem) => {
    const title = item.clipId ? item.clipTitle : item.episodeTitle
    const type = item.clipId ? translate('Clip') : translate('Episode')

    return {
      message: `${translate('Do you want to resume ')}${item.podcastTitle} - ${title}?`,
      title: `${translate('Recent ')}${type}`,
      buttons: [
        { text: translate('No') },
        {
          text: translate('Yes'),
          onPress: async () => {
            const shouldPlay = false
            const forceUpdateOrderDate = false
            const setCurrentItemNextInQueue = false
            await loadItemAndPlayTrack(item, shouldPlay, forceUpdateOrderDate, setCurrentItemNextInQueue)
          }
        }
      ]
    }
  },
  BUTTONS: {
    OK: [{ text: translate('OK') }]
  },
  EMAIL_NOT_VERIFIED: (email: string) => ({
    message: _sendVerificationEmailMessage,
    title: translate('Verify Your Email'),
    buttons: [{ text: _cancelText }, { text: _sendEmailText, onPress: () => sendVerificationEmail(email) }]
  }),
  FREE_TRIAL_EXPIRED: {
    message: _expiredMessage,
    title: translate('Free Trial Expired'),
    buttons: [{ text: _logoutButtonText, onPress: logoutUser }]
  },
  LEAVING_APP: {
    title: translate('Leaving App'),
    message: translate(
      'You are about to be navigated to a website outside the app Are you sure you want to leave brandName'
    )
  },
  LOGIN_INVALID: {
    message: translate('Invalid username or password'),
    title: translate('Login Error')
  },
  NETWORK_ERROR: {
    message: (str?: string) =>
      !str
        ? translate('Internet connection required')
        : `${translate('You must be connected to the internet to ')}${str}.`,
    title: _networkErrorTitle
  },
  PLAYER_CANNOT_STREAM_WITHOUT_WIFI: {
    message: translate('Connect to Wifi to stream this episode'),
    title: _networkErrorTitle
  },
  PREMIUM_MEMBERSHIP_EXPIRED: {
    message: _expiredMessage,
    title: translate('Premium Membership Expired'),
    buttons: [{ text: _logoutButtonText, onPress: logoutUser }]
  },
  PREMIUM_MEMBERSHIP_REQUIRED: {
    message: translate('Sign up for a premium account to use this feature'),
    title: translate('Premium Membership Required')
  },
  PURCHASE_CANCELLED: {
    message: translate('Purchase has been cancelled If you are seeing this in error please contact support'),
    title: translate('Purchase Cancelled')
  },
  PURCHASE_PENDING: {
    message: translate('Purchase is still pending'),
    title: translate('Purchase Pending')
  },
  PURCHASE_SUCCESS: {
    message: translate('Your purchase was successful You may close this window'),
    title: translate('Purchase Success')
  },
  PURCHASE_SOMETHING_WENT_WRONG: {
    message: translate('Please retry processing or contact support'),
    title: translate('Purchase Incomplete')
  },
  RESET_PASSWORD_SUCCESS: {
    message:
      // eslint-disable-next-line max-len
      `${translate('Please check your inbox If this address exists in our system you should receive a reset password email shortly')} ${translate('The email may go to your Spam folder')}`,
    title: translate('Reset Password Sent')
  },
  SIGN_UP_ERROR: {
    title: translate('Sign Up Error')
  },
  SOMETHING_WENT_WRONG: {
    message: translate('Please check your internet connection and try again later'),
    title: _networkErrorTitle
  }
}
