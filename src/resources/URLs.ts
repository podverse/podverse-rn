import AsyncStorage from '@react-native-community/async-storage'
import Config from 'react-native-config'
import { PV } from './PV'

const protocol = 'https://'
const domain = Config.WEB_DOMAIN || 'stage.podverse.fm'
const root = protocol + domain

const apiDefaultBaseUrl = Config.API_DOMAIN || 'https://api.stage.podverse.fm/api/v1'
const webDefaultBaseUrl = root

export const URLs = {
  apiDefaultBaseUrl,
  api: async () => {
    const isEnabled = await AsyncStorage.getItem(PV.Keys.CUSTOM_API_DOMAIN_ENABLED)
    const baseUrlOverride = await AsyncStorage.getItem(PV.Keys.CUSTOM_API_DOMAIN)
    return {
      baseUrl: (isEnabled && baseUrlOverride) || apiDefaultBaseUrl
    }
  },
  requestPodcast: Config.URL_EXTERNAL_REQUEST_PODCAST || '',
  social: {
    facebook: Config.URL_SOCIAL_FACEBOOK || '',
    github: Config.URL_SOCIAL_GITHUB || '',
    linkedin: Config.URL_SOCIAL_LINKEDIN || '',
    reddit: Config.URL_SOCIAL_REDDIT || '',
    twitter: Config.URL_SOCIAL_TWITTER || ''
  },
  web: async () => {
    const isEnabled = await AsyncStorage.getItem(PV.Keys.CUSTOM_WEB_DOMAIN_ENABLED)
    const baseUrlOverride = await AsyncStorage.getItem(PV.Keys.CUSTOM_WEB_DOMAIN)
    const base = isEnabled && baseUrlOverride ? baseUrlOverride : webDefaultBaseUrl
    return {
      baseUrl: base,
      clip: `${base}/clip/`,
      episode: `${base}/episode/`,
      playlist: `${base}/playlist/`,
      podcast: `${base}/podcast/`,
      profile: `${base}/profile/`
    }
  },
  webDefaultBaseUrl
}
