import AsyncStorage from '@react-native-community/async-storage'
import Config from 'react-native-config'
import { PV } from './PV'

const protocol = 'https://'
const domain = Config.WEB_DOMAIN || 'stage.podverse.fm'
const root = protocol + domain

const apiDefaultBaseUrl = Config.API_DOMAIN || 'https://api.stage.podverse.fm/api/v1'
const webDefaultBaseUrl = root

const webPaths = {
  clip: `/clip/`,
  episode: `/episode/`,
  playlist: `/playlist/`,
  podcast: `/podcast/`,
  profile: `/profile/`
}

export const URLs = {
  api: async () => {
    const isEnabled = await AsyncStorage.getItem(PV.Keys.CUSTOM_API_DOMAIN_ENABLED)
    const baseUrlOverride = await AsyncStorage.getItem(PV.Keys.CUSTOM_API_DOMAIN)
    return {
      baseUrl: (isEnabled && baseUrlOverride) || apiDefaultBaseUrl
    }
  },
  apiDefaultBaseUrl,
  social: {
    facebook: Config.URL_SOCIAL_FACEBOOK || '',
    github: Config.URL_SOCIAL_GITHUB || '',
    linkedin: Config.URL_SOCIAL_LINKEDIN || '',
    reddit: Config.URL_SOCIAL_REDDIT || '',
    twitter: Config.URL_SOCIAL_TWITTER || '',
    podcastIndex: Config.URL_PODCAST_INDEX || '',
    discord: Config.URL_SOCIAL_DISCORD || '',
    mastodonAccount: Config.URL_SOCIAL_MASTODON_ACCOUNT || ''
  },
  web: async () => {
    const isEnabled = await AsyncStorage.getItem(PV.Keys.CUSTOM_WEB_DOMAIN_ENABLED)
    const baseUrlOverride = await AsyncStorage.getItem(PV.Keys.CUSTOM_WEB_DOMAIN)
    const base = isEnabled && baseUrlOverride ? baseUrlOverride : webDefaultBaseUrl
    return {
      baseUrl: base,
      clip: `${base}${webPaths.clip}`,
      episode: `${base}${webPaths.episode}`,
      playlist: `${base}${webPaths.playlist}`,
      podcast: `${base}${webPaths.podcast}`,
      profile: `${base}${webPaths.profile}`
    }
  },
  webDefaultBaseUrl,
  webPaths,
  lnpay: {
    baseUrl: 'https://api.lnpay.co/v1',
    DeveloperDashboardUrl: 'https://lnpay.co/developers/dashboard',
    LoginUrl: 'https://dashboard.lnpay.co/home/login'
  }
}
