import AsyncStorage from '@react-native-community/async-storage'
import Config from 'react-native-config'
import { PV } from './PV'

const protocol = 'https://'
const domain = Config.WEB_DOMAIN || 'stage.podverse.fm'
const root = protocol + domain

// const apiDefaultBaseUrl = 'http://localhost:1234/api/v1'
const apiDefaultBaseUrl = Config.API_DOMAIN || 'https://api.stage.podverse.fm/api/v1'
const webDefaultBaseUrl = root

const webPaths = {
  clip: `/clip/`,
  episode: `/episode/`,
  playlist: `/playlist/`,
  podcast: `/podcast/`,
  profile: `/profile/`,
  tutorials: `/tutorials`
}

export const URLs = {
  api: async () => {
    const [isEnabled, baseUrlOverride] = await Promise.all([
      AsyncStorage.getItem(PV.Keys.CUSTOM_API_DOMAIN_ENABLED),
      AsyncStorage.getItem(PV.Keys.CUSTOM_API_DOMAIN)
    ])

    return {
      baseUrl: (isEnabled && baseUrlOverride) || apiDefaultBaseUrl
    }
  },
  apiDefaultBaseUrl,
  appRepo: Config.URL_APP_REPO || '',
  social: {
    facebook: Config.URL_SOCIAL_FACEBOOK || '',
    github: Config.URL_SOCIAL_GITHUB || '',
    linkedin: Config.URL_SOCIAL_LINKEDIN || '',
    reddit: Config.URL_SOCIAL_REDDIT || '',
    twitter: Config.URL_SOCIAL_TWITTER || '',
    podcastIndex: Config.URL_PODCAST_INDEX || '',
    discord: Config.URL_SOCIAL_DISCORD || '',
    mastodonAccount: Config.URL_SOCIAL_MASTODON_ACCOUNT || '',
    matrix: Config.URL_SOCIAL_MATRIX || ''
  },
  xmpp: {
    chatRooms: {
      general: Config.URL_XMPP_CHAT_ROOM_GENERAL,
      dev: Config.URL_XMPP_CHAT_ROOM_DEV,
      translations: Config.URL_XMPP_CHAT_ROOM_TRANSLATIONS
    },
    libraries: {
      prosody: 'https://prosody.im/',
      snikket: 'https://snikket.org/',
      converse: 'https://conversejs.org/'
    },
    webClientUrl: Config.URL_XMPP_WEB_CLIENT
  },
  web: async () => {
    const [isEnabled, baseUrlOverride] = await Promise.all([
      AsyncStorage.getItem(PV.Keys.CUSTOM_WEB_DOMAIN_ENABLED),
      AsyncStorage.getItem(PV.Keys.CUSTOM_WEB_DOMAIN)
    ])
    const base = isEnabled && baseUrlOverride ? baseUrlOverride : webDefaultBaseUrl
    return {
      baseUrl: base,
      clip: `${base}${webPaths.clip}`,
      episode: `${base}${webPaths.episode}`,
      playlist: `${base}${webPaths.playlist}`,
      podcast: `${base}${webPaths.podcast}`,
      profile: `${base}${webPaths.profile}`,
      tutorials: `${base}${webPaths.tutorials}`
    }
  },
  webDefaultBaseUrl,
  webPaths
}
