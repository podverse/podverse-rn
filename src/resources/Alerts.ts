export const Alerts = {
  NETWORK_ERROR: {
    message: (str?: string) => !str ? 'Internet connection required' : `You must be connected to the internet to ${str}.`,
    title: 'Network Error'
  },
  PLAYER_CANNOT_STREAM_WITHOUT_WIFI: {
    message: 'Connect to Wifi to stream this episode.',
    title: 'Network Error'
  },
  PREMIUM_MEMBERSHIP_REQUIRED: {
    message: 'Sign up for a premium account to use this feature.',
    title: 'Premium Membership Required'
  },
  SOMETHING_WENT_WRONG: {
    message: 'Please check your internet connection and try again.',
    title: 'Network Error'
  }
}
