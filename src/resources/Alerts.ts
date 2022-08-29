import { NowPlayingItem } from 'podverse-shared'
import { translate } from '../lib/i18n'
import { navigateToEpisodeScreenInPodcastsStackNavigatorWithIds } from '../lib/navigate'
import { sendVerificationEmail } from '../services/auth'
import { logoutUser } from '../state/actions/auth'
import { playerLoadNowPlayingItem } from '../state/actions/player'
import { PV } from '.'

const _expiredMessage = translate('To renew your membership please visit the Membership page')
const _logoutButtonText = translate('Log Out')
const _networkErrorTitle = translate('Network error')
const _sendEmailText = translate('Send Email')
const _sendVerificationEmailMessage = translate(
  'You must verify your email address to login Press Send Email then check your inbox of a verification email'
)
const _cancelText = translate('Cancel')

export const Alerts = {
  ASK_TO_SYNC_LOCAL_PODCASTS_WITH_SERVER: (handleSync: any, callback: any) => {
    return {
      message: `${translate('Ask to sync local podcasts with server')}`,
      title: `${translate('Sync podcasts')}`,
      buttons: [
        {
          text: translate('No remove them'),
          onPress: callback
        },
        {
          text: translate('Yes save them'),
          onPress: handleSync
        }
      ]
    }
  },
  ASK_TO_SYNC_WITH_LAST_HISTORY_ITEM: (item: NowPlayingItem, callback: any) => {
    const title = item.clipId ? item.clipTitle : item.episodeTitle
    const type = item.clipId ? translate('Clip') : translate('Episode')

    return {
      message: `${translate('Do you want to resume ')} ${item?.podcastTitle} - ${title}?`,
      title: `${translate('Recent ')}${type}`,
      buttons: [
        {
          text: translate('No'),
          onPress: () => {
            callback?.()
          }
        },
        {
          text: translate('Yes'),
          onPress: async () => {
            const shouldPlay = false
            const forceUpdateOrderDate = false
            const setCurrentItemNextInQueue = false
            await playerLoadNowPlayingItem(item, shouldPlay, forceUpdateOrderDate, setCurrentItemNextInQueue)
            callback?.()
          }
        }
      ]
    }
  },
  BUTTONS: {
    OK: [{ text: translate('OK') }]
  },
  GO_TO_LOGIN_BUTTONS: (navigation: any) => [
    { text: translate('OK') },
    {
      text: translate('Go to Login'),
      onPress: () => navigation.navigate(PV.RouteNames.AuthScreen)
    }
  ],
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
  GO_TO_LIVE_PODCAST: (
    navigation: any,
    podcastId: string,
    episodeId: string,
    podcastTitle?: string,
    episodeTitle?: string,
    _goBackWithDelay?: any
  ) => ({
    title: translate('Go to live podcast'),
    message: `${podcastTitle} – ${episodeTitle}`,
    buttons: [
      { text: _cancelText },
      {
        text: translate('Yes'),
        onPress: async () => {
          await _goBackWithDelay()
          setTimeout(() => {
            navigateToEpisodeScreenInPodcastsStackNavigatorWithIds(navigation, podcastId, episodeId)
          }, PV.Navigation.navigationTimeoutDelay)
        }
      }
    ]
  }),
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
  LOGIN_TO_ENABLE_PODCAST_NOTIFICATIONS: {
    message: translate('Login to enable podcast notifications'),
    title: translate('Login Needed')
  },
  LOGIN_TO_MARK_EPISODES_AS_PLAYED: {
    message: translate('Please login to mark episodes as played'),
    title: translate('Login Needed')
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
  PLAYER_CANNOT_DOWNLOAD_WITHOUT_WIFI: {
    message: translate('Connect to Wifi to download this episode'),
    title: _networkErrorTitle
  },
  PREMIUM_MEMBERSHIP_EXPIRED: {
    message: _expiredMessage,
    title: translate('Premium Membership Expired'),
    buttons: [{ text: _logoutButtonText, onPress: logoutUser }]
  },
  PREMIUM_MEMBERSHIP_REQUIRED: {
    message: translate('Sign up for a premium membership to use this feature'),
    title: translate('Premium Membership Required')
  },
  PURCHASE_CANCELLED: {
    message: translate('Purchase has been cancelled If you are seeing this in error please contact support'),
    title: translate('Cancelled')
  },
  PURCHASE_PENDING: {
    message: translate('Purchase is still pending'),
    title: translate('Pending')
  },
  PURCHASE_SUCCESS: {
    message: translate('Your purchase was successful You may close this window'),
    title: translate('Purchased')
  },
  PURCHASE_SOMETHING_WENT_WRONG: {
    message: translate('Please retry processing or contact support'),
    title: translate('Incomplete')
  },
  RESET_PASSWORD_SUCCESS: {
    message:
      // eslint-disable-next-line max-len
      `${translate(
        'Please check your inbox If this address exists in our system you should receive a reset password email shortly'
      )} ${translate('The email may go to your Spam folder')}`,
    title: translate('Reset Password Sent')
  },
  SIGN_UP_ERROR: {
    title: translate('Sign Up Error')
  },
  SOMETHING_WENT_WRONG: {
    message: translate('Please check your internet connection and try again later'),
    title: _networkErrorTitle
  },
  ENABLE_NOTIFICATIONS_SETTINGS: {
    message: translate('Enable notifications in settings message'),
    title: translate('Enable Notifications')
  }
}
