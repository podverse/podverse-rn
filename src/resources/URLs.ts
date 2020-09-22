import AsyncStorage from '@react-native-community/async-storage'
import Config from 'react-native-config'
import { PV } from './PV'

const protocol = 'https://'
const domain = Config.WEB_DOMAIN || 'stage.podverse.fm'
const root = protocol + domain

export const URLs = {
  api: async () => {
    const baseUrlOverride = await AsyncStorage.getItem(PV.Keys.CUSTOM_API_DOMAIN)
    return {
      baseUrl: baseUrlOverride || Config.API_DOMAIN || 'https://api.stage.podverse.fm/api/v1'
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
    const baseUrlOverride = await AsyncStorage.getItem(PV.Keys.CUSTOM_WEB_DOMAIN)
    const base = baseUrlOverride ? baseUrlOverride : root
    return {
      baseUrl: base,
      clip: `${base}/clip/`,
      episode: `${base}/episode/`,
      playlist: `${base}/playlist/`,
      podcast: `${base}/podcast/`,
      profile: `${base}/profile/`
    }
  }
}
