import Config from 'react-native-config'

const protocol = 'https://'
const domain = Config.RN_WEB_DOMAIN || 'stage.podverse.fm'
const root = protocol + domain

export const URLs = {
  about: `${root}/about`,
  // tslint:disable-next-line: max-line-length
  baseUrl: Config.RN_API_DOMAIN || 'https://api.stage.podverse.fm/api/v1',
  clip: `${root}/clip/`,
  contact: 'https://docs.google.com/forms/d/e/1FAIpQLSe-1_1qmv5Z21ZLc37KWke3cXFluItnzmstjqGwm9_BT7BGRg/viewform',
  episode: `${root}/episode/`,
  playlist: `${root}/playlist/`,
  podcast: `${root}/podcast/`,
  profile: `${root}/profile/`,
  // tslint:disable-next-line: max-line-length
  requestPodcast: `https://docs.google.com/forms/d/e/1FAIpQLSdewKP-YrE8zGjDPrkmoJEwCxPl_gizEkmzAlTYsiWAuAk1Ng/viewform?usp=sf_link`,
  terms: `${root}/terms`,
  social: {
    facebook: 'https://facebook.com/podverse',
    github: 'https://github.com/podverse',
    linkedin: 'https://www.linkedin.com/company/podverse/',
    reddit: 'https://reddit.com/r/podverse',
    twitter: 'https://twitter.com/podverse'
  }
}
