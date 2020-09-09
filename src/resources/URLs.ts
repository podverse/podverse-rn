import Config from 'react-native-config'

const protocol = 'https://'
const domain = Config.WEB_DOMAIN || 'stage.podverse.fm'
const root = protocol + domain

export const URLs = {
  about: `${root}/about`,
  // tslint:disable-next-line: max-line-length
  baseUrl: Config.API_DOMAIN || 'https://api.stage.podverse.fm/api/v1',
  clip: `${root}/clip/`,
  episode: `${root}/episode/`,
  playlist: `${root}/playlist/`,
  podcast: `${root}/podcast/`,
  profile: `${root}/profile/`,
  // tslint:disable-next-line: max-line-length
  requestPodcast: Config.URL_EXTERNAL_REQUEST_PODCAST || '',
  terms: `${root}/terms`,
  social: {
    facebook: Config.URL_SOCIAL_FACEBOOK || '',
    github: Config.URL_SOCIAL_GITHUB || '',
    linkedin: Config.URL_SOCIAL_LINKEDIN || '',
    reddit: Config.URL_SOCIAL_REDDIT || '',
    twitter: Config.URL_SOCIAL_TWITTER || ''
  }
}
